import { Injectable, BadRequestException } from '@nestjs/common';
import * as pdfParse from 'pdf-parse';
import * as mammoth from 'mammoth';
import * as rtfParser from 'rtf-parser';
import { Candidate } from './entities/candidate.entity';
import { FileManagementService } from '@/file-management/file-management.service';
import { Readable } from 'stream';
import Anthropic from '@anthropic-ai/sdk';

/**
 * Interface for parsed resume data
 */
export interface ParsedResumeData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  currentPosition?: string;
  expectedPosition?: string;
  resume: string;
  metadata?: Record<string, any>;
}

/**
 * Service responsible for parsing resumes in various formats
 * and extracting candidate information
 */
@Injectable()
export class ResumeParserService {
  private anthropic: Anthropic;

  constructor(private readonly fileManagementService: FileManagementService) {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  /**
   * Parses a resume file and extracts candidate information
   *
   * @param fileId - The ID of the file to parse
   * @returns Parsed resume data
   */
  async parseResume(fileId: string): Promise<ParsedResumeData> {
    try {
      // Get the file stream from the file management service
      const fileStream =
        await this.fileManagementService.getPermentStorageObjectStream(fileId);

      // Convert stream to buffer
      const chunks: Buffer[] = [];
      for await (const chunk of fileStream.Body as Readable) {
        chunks.push(Buffer.from(chunk));
      }
      const fileBuffer = Buffer.concat(chunks);

      // Get file metadata to determine file type
      const fileMetadata =
        await this.fileManagementService.getDirtyBucketObjectMetadata(fileId);
      const fileType = fileMetadata.ContentType;

      let textContent = '';

      // Parse based on file type
      switch (fileType) {
        case 'application/pdf':
          textContent = await this.parsePdf(fileBuffer);
          break;
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        case 'application/msword':
          textContent = await this.parseWord(fileBuffer, fileType);
          break;
        case 'text/rtf':
          textContent = await this.parseRtf(fileBuffer);
          break;
        case 'text/plain':
          textContent = fileBuffer.toString('utf-8');
          break;
        default:
          throw new BadRequestException(
            `Unsupported file type: ${fileType}. Supported types are PDF, DOC, DOCX, RTF, and TXT.`,
          );
      }

      // Extract candidate information using Claude
      return this.extractCandidateInfoWithClaude(textContent);
    } catch (error) {
      throw new BadRequestException(`Failed to parse resume: ${error.message}`);
    }
  }

  /**
   * Parses a PDF file and extracts text content
   *
   * @param fileBuffer - The PDF file buffer
   * @returns Extracted text content
   */
  private async parsePdf(fileBuffer: Buffer): Promise<string> {
    const data = await pdfParse(fileBuffer);
    return data.text;
  }

  /**
   * Parses a Word document (DOC or DOCX) and extracts text content
   *
   * @param fileBuffer - The Word document buffer
   * @param fileType - The MIME type of the file
   * @returns Extracted text content
   */
  private async parseWord(
    fileBuffer: Buffer,
    fileType: string,
  ): Promise<string> {
    if (
      fileType ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      // Parse DOCX
      const result = await mammoth.extractRawText({ buffer: fileBuffer });
      return result.value;
    } else {
      // For DOC files, we'll use mammoth as well as it can handle some DOC formats
      const result = await mammoth.extractRawText({ buffer: fileBuffer });
      return result.value;
    }
  }

  /**
   * Parses an RTF file and extracts text content
   *
   * @param fileBuffer - The RTF file buffer
   * @returns Extracted text content
   */
  private async parseRtf(fileBuffer: Buffer): Promise<string> {
    return new Promise((resolve, reject) => {
      const rtfContent = fileBuffer.toString('utf-8');
      rtfParser.parse(rtfContent, (err, doc) => {
        if (err) {
          reject(err);
          return;
        }

        // Extract text from the parsed RTF document
        let text = '';
        if (doc && doc.content) {
          text = this.extractTextFromRtfDoc(doc);
        }
        resolve(text);
      });
    });
  }

  /**
   * Recursively extracts text from an RTF document
   *
   * @param node - The RTF document node
   * @returns Extracted text
   */
  private extractTextFromRtfDoc(node: any): string {
    if (!node) return '';

    if (typeof node === 'string') {
      return node;
    }

    if (Array.isArray(node)) {
      return node.map((item) => this.extractTextFromRtfDoc(item)).join('');
    }

    if (node.content) {
      return this.extractTextFromRtfDoc(node.content);
    }

    return '';
  }

  /**
   * Extracts candidate information from parsed text using Claude
   *
   * @param text - The parsed text content
   * @returns Extracted candidate information
   */
  private async extractCandidateInfoWithClaude(
    text: string,
  ): Promise<ParsedResumeData> {
    try {
      const prompt = `Please analyze this resume and extract the following information in JSON format:
      - firstName (string)
      - lastName (string)
      - email (string)
      - phone (string)
      - currentPosition (string)
      - expectedPosition (string)
      - skills (array of strings)
      - experience (array of objects with company, position, duration, and description)
      - education (array of objects with institution, degree, field, and year)
      
      Resume text:
      ${text}
      
      Return only the JSON object, no additional text.`;

      const response = await this.anthropic.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 1000,
        temperature: 0,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const content = response.content[0];
      if (!content || content.type !== 'text') {
        throw new Error('Invalid response from Claude');
      }

      const parsedData = JSON.parse(content.text);

      return {
        firstName: parsedData.firstName,
        lastName: parsedData.lastName,
        email: parsedData.email,
        phone: parsedData.phone,
        currentPosition: parsedData.currentPosition,
        expectedPosition: parsedData.expectedPosition,
        resume: text,
        metadata: {
          skills: parsedData.skills,
          experience: parsedData.experience,
          education: parsedData.education,
          parsedAt: new Date().toISOString(),
          confidence: 1, // Since we're using Claude, we can assume high confidence
        },
      };
    } catch (error: any) {
      console.error('Claude parsing failed:', error.message);
      // Fallback to regex-based extraction if Claude fails
      return this.extractCandidateInfo(text);
    }
  }

  /**
   * Extracts candidate information from parsed text
   *
   * @param text - The parsed text content
   * @returns Extracted candidate information
   */
  private extractCandidateInfo(text: string): ParsedResumeData {
    // Initialize the result with the full text as resume content
    const result: ParsedResumeData = {
      resume: text,
      metadata: {},
    };

    // Extract email using regex
    const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi;
    const emailMatches = text.match(emailRegex);
    if (emailMatches && emailMatches.length > 0) {
      result.email = emailMatches[0];
    }

    // Extract phone number using regex
    const phoneRegex =
      /(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
    const phoneMatches = text.match(phoneRegex);
    if (phoneMatches && phoneMatches.length > 0) {
      result.phone = phoneMatches[0].replace(/\s+/g, '');
    }

    // Extract name (this is a simple approach and might need improvement)
    const nameRegex = /([A-Z][a-z]+)\s+([A-Z][a-z]+)/g;
    const nameMatches = text.match(nameRegex);
    if (nameMatches && nameMatches.length > 0) {
      const nameParts = nameMatches[0].split(' ');
      result.firstName = nameParts[0];
      result.lastName = nameParts[1];
    }

    // Extract current position
    const currentPositionRegex =
      /(?:Current|Present|Current Position|Role|Job Title)[:\s]+([^\n]+)/i;
    const currentPositionMatch = text.match(currentPositionRegex);
    if (currentPositionMatch && currentPositionMatch[1]) {
      result.currentPosition = currentPositionMatch[1].trim();
    }

    // Extract expected position (if mentioned)
    const expectedPositionRegex =
      /(?:Expected|Desired|Looking for|Seeking|Position Applied)[:\s]+([^\n]+)/i;
    const expectedPositionMatch = text.match(expectedPositionRegex);
    if (expectedPositionMatch && expectedPositionMatch[1]) {
      result.expectedPosition = expectedPositionMatch[1].trim();
    }

    // Add metadata about the parsing process
    result.metadata = {
      parsedAt: new Date().toISOString(),
      confidence: this.calculateConfidence(result),
    };

    return result;
  }

  /**
   * Calculates a confidence score for the parsed data
   *
   * @param data - The parsed resume data
   * @returns Confidence score (0-1)
   */
  private calculateConfidence(data: ParsedResumeData): number {
    let score = 0;
    let totalFields = 0;

    // Check each field and increment score if present
    if (data.firstName) {
      score += 1;
      totalFields += 1;
    }

    if (data.lastName) {
      score += 1;
      totalFields += 1;
    }

    if (data.email) {
      score += 1;
      totalFields += 1;
    }

    if (data.phone) {
      score += 1;
      totalFields += 1;
    }

    if (data.currentPosition) {
      score += 1;
      totalFields += 1;
    }

    if (data.expectedPosition) {
      score += 1;
      totalFields += 1;
    }

    // Calculate final score
    return totalFields > 0 ? score / totalFields : 0;
  }

  /**
   * Updates a candidate entity with parsed resume data
   *
   * @param candidate - The candidate entity to update
   * @param parsedData - The parsed resume data
   * @returns Updated candidate entity
   */
  updateCandidateWithParsedData(
    candidate: Candidate,
    parsedData: ParsedResumeData,
  ): Candidate {
    // Only update fields that are not already set in the candidate
    if (!candidate.firstName && parsedData.firstName) {
      candidate.firstName = parsedData.firstName;
    }

    if (!candidate.lastName && parsedData.lastName) {
      candidate.lastName = parsedData.lastName;
    }

    if (!candidate.email && parsedData.email) {
      candidate.email = parsedData.email;
    }

    if (!candidate.phone && parsedData.phone) {
      candidate.phone = parsedData.phone;
    }

    if (!candidate.currentPosition && parsedData.currentPosition) {
      candidate.currentPosition = parsedData.currentPosition;
    }

    if (!candidate.expectedPosition && parsedData.expectedPosition) {
      candidate.expectedPosition = parsedData.expectedPosition;
    }

    // Always update the resume field with the parsed text
    candidate.resume = parsedData.resume;

    // Update metadata if it exists
    if (parsedData.metadata) {
      candidate.metadata = {
        ...candidate.metadata,
        ...parsedData.metadata,
      };
    }

    return candidate;
  }
}
