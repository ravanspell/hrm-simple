import { Injectable, BadRequestException } from '@nestjs/common';
import { CandidateRepository } from './candidate.repository';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { UpdateCandidateDto } from './dto/update-candidate.dto';
import { FilterCandidateDto } from './dto/filter-candidate.dto';
import { Candidate } from './entities/candidate.entity';
import { ResumeParserService, ParsedResumeData } from './resume-parser.service';

/**
 * Service responsible for managing candidate data and operations
 * Provides business logic for CRUD operations on candidates
 */
@Injectable()
export class CandidateService {
  constructor(
    private readonly candidateRepository: CandidateRepository,
    private readonly resumeParserService: ResumeParserService,
  ) {}

  /**
   * Creates a new candidate in the system
   *
   * @param createCandidateDto - Data for creating a new candidate
   * @returns The newly created candidate
   */
  async create(createCandidateDto: CreateCandidateDto): Promise<Candidate> {
    return await this.candidateRepository.create(createCandidateDto);
  }

  /**
   * Retrieves all candidates with optional filtering and pagination
   *
   * @param filter - Filter criteria for candidates (name, email, status, etc.)
   * @returns Object containing candidates and total count
   */
  async findAll(
    filter: FilterCandidateDto,
  ): Promise<{ data: Candidate[]; total: number }> {
    const [candidates, total] = await this.candidateRepository.findAll(filter);
    return { data: candidates, total };
  }

  /**
   * Retrieves a single candidate by ID
   *
   * @param id - Unique identifier of the candidate
   * @returns The candidate if found
   * @throws NotFoundException if candidate doesn't exist
   */
  async findOne(id: string): Promise<Candidate> {
    const candidate = await this.candidateRepository.findOne(id);
    if (!candidate) {
      throw new BadRequestException(`Candidate with ID ${id} not found`);
    }
    return candidate;
  }

  /**
   * Updates an existing candidate
   *
   * @param id - Unique identifier of the candidate to update
   * @param updateCandidateDto - Data to update the candidate with
   * @returns The updated candidate
   * @throws NotFoundException if candidate doesn't exist
   */
  async update(
    id: string,
    updateCandidateDto: UpdateCandidateDto,
  ): Promise<Candidate> {
    // Check if candidate exists before updating
    await this.findOne(id);
    return await this.candidateRepository.update(id, updateCandidateDto);
  }

  /**
   * Removes a candidate from the system
   *
   * @param id - Unique identifier of the candidate to remove
   * @throws NotFoundException if candidate doesn't exist
   */
  async remove(id: string): Promise<void> {
    // Check if candidate exists before removing
    await this.findOne(id);
    await this.candidateRepository.remove(id);
  }

  /**
   * Parses a resume file and creates a new candidate with the extracted data
   *
   * @param documentId - The ID of the document to parse
   * @returns The newly created candidate with parsed resume data
   */
  async parseResumeAndCreateCandidate(documentId: string): Promise<Candidate> {
    // Parse the resume using document ID
    const parsedData = await this.resumeParserService.parseResume(documentId);

    // Create a new candidate with the parsed data
    const createCandidateDto: CreateCandidateDto = {
      firstName: parsedData.firstName || '',
      lastName: parsedData.lastName || '',
      email: parsedData.email || '',
      phone: parsedData.phone || '',
      currentPosition: parsedData.currentPosition || '',
      expectedPosition: parsedData.expectedPosition || '',
      resume: parsedData.resume,
      status: 'PENDING',
      metadata: parsedData.metadata,
    };

    // Create and return the candidate
    return await this.create(createCandidateDto);
  }

  /**
   * Parses a resume file and updates an existing candidate with the extracted data
   *
   * @param id - Unique identifier of the candidate to update
   * @param documentId - The ID of the document to parse
   * @returns The updated candidate with parsed resume data
   * @throws NotFoundException if candidate doesn't exist
   */
  async parseResumeAndUpdateCandidate(
    id: string,
    documentId: string,
  ): Promise<Candidate> {
    // Check if candidate exists
    const candidate = await this.findOne(id);

    // Parse the resume using document ID
    const parsedData = await this.resumeParserService.parseResume(documentId);

    // Update the candidate with the parsed data
    const updatedCandidate =
      this.resumeParserService.updateCandidateWithParsedData(
        candidate,
        parsedData,
      );

    // Save and return the updated candidate
    return await this.candidateRepository.update(id, updatedCandidate);
  }

  /**
   * Parses a resume file and returns the extracted data without creating or updating a candidate
   *
   * @param documentId - The ID of the document to parse
   * @returns The parsed resume data
   */
  async parseResumeOnly(documentId: string): Promise<ParsedResumeData> {
    return await this.resumeParserService.parseResume(documentId);
  }
}
