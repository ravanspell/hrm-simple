import { Injectable, BadRequestException } from '@nestjs/common';
import * as pdfParse from 'pdf-parse';
import * as mammoth from 'mammoth';
import * as rtfParser from 'rtf-parser';
import { Candidate } from './entities/candidate.entity';
import {
  createFileData,
  FileManagementService,
} from '@/file-management/file-management.service';
import { Readable } from 'stream';
import Anthropic from '@anthropic-ai/sdk';

/**
 * Interface for work experience entry
 */
interface WorkExperience {
  company: string;
  jobTitle: string;
  duration: string;
  responsibilities: string[];
}

/**
 * Interface for education entry
 */
interface Education {
  institution: string;
  degree: string;
  graduationYear: string;
}

/**
 * Interface for project entry
 */
interface Project {
  projectTitle: string;
  description: string;
}

/**
 * Interface for job matching analysis
 */
interface JobMatching {
  matchingScore: number;
  skillGap: string[];
}

/**
 * Interface for recommendations
 */
interface Recommendations {
  resumeOptimization: string;
  jobRecommendations: string[];
}

/**
 * Interface for structured resume data
 */
interface StructuredResume {
  workExperience: WorkExperience[];
  education: Education[];
  skills: string[];
  certifications: string[];
  projects: Project[];
}

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
  structuredResume: StructuredResume;
  jobMatching: JobMatching;
  recommendations: Recommendations;
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
  async parseResume(
    createFileData: createFileData,
    userId: string,
    organizationId: string,
  ): Promise<{ dataForSave: ParsedResumeData; parsedData: any }> {
    const isFileExists =
      await this.fileManagementService.getPermanentBucketObjectMetadata(
        createFileData.s3ObjectKey,
      );
    // this check usefull when resume queue retry but file already on the permenent storage
    if (!isFileExists) {
      // Get the file stream from the file management service
      await this.fileManagementService.confirmUpload(
        [createFileData],
        organizationId,
        userId,
      );
    }
    const [fileStream, fileMetadata] = await Promise.all([
      // Get file stream from the file management service
      this.fileManagementService.getPermentStorageObjectStream(
        createFileData.s3ObjectKey,
      ),
      // Get file metadata to determine file type
      this.fileManagementService.getPermanentBucketObjectMetadata(
        createFileData.s3ObjectKey,
      ),
    ]);
    // Convert stream to buffer
    const chunks: Buffer[] = [];
    for await (const chunk of fileStream.Body as Readable) {
      chunks.push(Buffer.from(chunk));
    }
    const fileBuffer = Buffer.concat(chunks);
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
  ): Promise<{ dataForSave: ParsedResumeData; parsedData: any }> {
    try {
      const prompt = `You are an expert resume analyzer. 
      Your task is to process the provided resume data—already filtered to remove any Personally Identifiable Information (PII)—and extract the following details into a structured JSON format. Analyze the resume data for:

        1. **Structured Resume Data**  
        - **Personal Information**: Extract:
            - "firstName"
            - "lastName"
            - "email"
            - "phone"
            - "current_position"
            - "expected_position"
        - **Work Experience**: For each job, extract:
            - "company" (organization name)
            - "job_title"
            - "duration" (dates or years)
            - "responsibilities" (list of key responsibilities)
        - **Education**: For each educational entry, extract:
            - "institution"
            - "degree"
            - "graduation_year" (or duration)
        - **Skills**: List technical and soft skills.
        - **Certifications**: List any certifications mentioned.
        - **Projects** (if available): List key projects with a brief description.

        2. **Job Matching Analysis**  
        - Compare the resume data with a provided job description.
        - Provide a "matching_score" (from 0 to 100) based on how well the skills, experience, and education match.
        - Identify any "skill_gap" items (i.e., skills mentioned in the job description that are missing in the resume).

        3. **Recommendations**  
        - Provide "resume_optimization" suggestions (e.g., keyword enhancements or formatting tips).
        - Provide a list of "job_recommendations" based on the resume analysis.

        Resume text:
        ${text}

        Return only the JSON object in the following structure, no additional text or commentary:

        {
            "personalInformation": {
                "firstName": "<first_name>",
                "lastName": "<last_name>",
                "email": "<email>",
                "phone": "<phone>",
                "currentPosition": "<current_position>",
                "expectedPosition": "<expected_position>"
            },
            "structuredResume": {
                "workExperience": [
                {
                    "company": "<company_name>",
                    "jobTitle": "<job_title>",
                    "duration": "<duration>",
                    "responsibilities": ["<responsibility_1>", "<responsibility_2>", "..."]
                }
                ],
                "education": [
                {
                    "institution": "<institution_name>",
                    "degree": "<degree>",
                    "graduationYear": "<year>"
                }
                ],
                "skills": ["<skill_1>", "<skill_2>", "..."],
                "certifications": ["<certification_1>", "<certification_2>", "..."],
                "projects": [
                {
                    "project_title": "<project_title>",
                    "description": "<brief_description>"
                }
                ]
            },
            "jobMatching": {
                "matchingScore": <number>,
                "skillGap": ["<missing_skill_1>", "<missing_skill_2>", "..."]
            },
            "recommendations": {
                "resumeOptimization": "<optimization_suggestions>",
                "jobRecommendations": ["<job_recommendation_1>", "<job_recommendation_2>", "..."]
            }
        }`;

      const response = await this.anthropic.messages.create({
        // Haiku is faster and cheaper than Sonnet
        // https://docs.anthropic.com/en/docs/about-claude/models/all-models#model-comparison-table
        model: 'claude-3-haiku-20240307',
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

      const dataForSave: ParsedResumeData = {
        firstName: parsedData.personalInformation.firstName,
        lastName: parsedData.personalInformation.lastName,
        email: parsedData.personalInformation.email,
        phone: parsedData.personalInformation.phone,
        currentPosition: parsedData.personalInformation.currentPosition,
        expectedPosition: parsedData.personalInformation.expectedPosition,
        resume: text,
        structuredResume: parsedData.structuredResume,
        jobMatching: parsedData.jobMatching,
        recommendations: parsedData.recommendations,
      };
      return {
        dataForSave,
        parsedData,
      };
    } catch (error: any) {
      console.error('Claude parsing failed:', error.message);
      throw new BadRequestException(`Failed to parse resume: ${error.message}`);
    }
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

    // Store the structured resume data in the resume field
    candidate.resume = {
      rawText: parsedData.resume,
      structuredData: parsedData.structuredResume,
      jobMatching: parsedData.jobMatching,
      recommendations: parsedData.recommendations,
      metadata: parsedData.metadata || {},
    };

    return candidate;
  }
}
