import { Injectable, BadRequestException } from '@nestjs/common';
import { CandidateRepository } from './candidate.repository';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { UpdateCandidateDto } from './dto/update-candidate.dto';
import { FilterCandidateDto } from './dto/filter-candidate.dto';
import { Candidate } from './entities/candidate.entity';
import { ResumeParserService } from './resume-parser.service';
import { AwsSqsService } from '@/utilities/aws-sqs-service/aws-sqs.service';
import { ConfigService } from '@nestjs/config';
import { ResumeFileDto } from './dto/create-candidates.dto';

/**
 * Service responsible for managing candidate data and operations
 * Provides business logic for CRUD operations on candidates
 */
@Injectable()
export class CandidateService {
  private readonly resumeParserQueueUrl: string;

  constructor(
    private readonly candidateRepository: CandidateRepository,
    private readonly resumeParserService: ResumeParserService,
    private readonly awsSqsService: AwsSqsService,
    private readonly configService: ConfigService,
  ) {
    this.resumeParserQueueUrl = this.configService.get<string>(
      'RESUME_PARSER_QUEUE_URL',
    );
  }

  /**
   * Creates a new candidate in the system
   *
   * @param createCandidateDto - Data for creating a new candidate
   * @returns The newly created candidate
   */
  async create(createCandidateDto: CreateCandidateDto): Promise<Candidate> {
    return this.candidateRepository.createCandidate(createCandidateDto);
  }

  /**
   * Retrieves all candidates with optional filtering and pagination
   *
   * @param filter - Filter criteria for candidates (name, email, status, etc.)
   * @returns Object containing candidates and total count
   */
  async findAllCandidates(filter: FilterCandidateDto) {
    const [candidates, total] =
      await this.candidateRepository.findAllCandidates(filter);
    const page = filter.page || 1;
    const limit = filter.limit || 10;
    const totalPages = Math.ceil(total / limit);

    return {
      candidates,
      total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Retrieves a single candidate by ID
   *
   * @param id - Unique identifier of the candidate
   * @returns The candidate if found
   * @throws NotFoundException if candidate doesn't exist
   */
  async getIndividualCandidate(id: string): Promise<Candidate> {
    const candidate = await this.candidateRepository.findCandidateById(id);
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
    await this.getIndividualCandidate(id);
    return await this.candidateRepository.updateCandidate(
      id,
      updateCandidateDto,
    );
  }

  /**
   * Removes a candidate from the system
   *
   * @param id - Unique identifier of the candidate to remove
   * @throws NotFoundException if candidate doesn't exist
   */
  async remove(id: string): Promise<void> {
    // Check if candidate exists before removing
    await this.getIndividualCandidate(id);
    await this.candidateRepository.removeCandidate(id);
  }

  /**
   * Creates candidate entries with dummy data and queues resume parsing
   *
   * @param resumeFiles - Array of resume file data
   * @param userId - ID of the user creating the candidates
   * @param organizationId - ID of the organization
   * @returns Array of created candidates
   */
  async createCandidatesWithResumeParsing(
    resumeFiles: ResumeFileDto[],
    userId: string,
    organizationId: string,
  ): Promise<Candidate[]> {
    // Step 1: Create candidate entries with dummy data
    const candidates: Candidate[] = [];

    for (const resumeFile of resumeFiles) {
      // Create a candidate with dummy data
      const createCandidateDto: CreateCandidateDto = {
        firstName: 'Processing...',
        lastName: '-',
        email: `temp_${Date.now()}@example.com`,
        status: 'PROCESSING', // Set initial status as PROCESSING
      };

      // Create the candidate
      const candidate = await this.create(createCandidateDto);

      candidates.push(candidate);

      // Step 2: Create SQS message for resume parsing
      const resumeParserMessage = {
        candidateId: candidate.id,
        fileName: resumeFile.fileName,
        s3ObjectKey: resumeFile.s3ObjectKey,
        fileSize: resumeFile.fileSize,
        userId: userId,
        organizationId: organizationId,
      };

      // Publish message to SQS queue
      await this.awsSqsService.publishMessage(
        this.resumeParserQueueUrl,
        JSON.stringify(resumeParserMessage),
        { Type: 'resume_parser' },
      );
    }

    return candidates;
  }

  /**
   * Parses a resume file and creates a new candidate with the extracted data
   *
   * @param createFileData - The file data of the resume to parse
   * @param userId - ID of the user creating the candidate
   * @param organizationId - ID of the organization
   * @returns The newly created candidate with parsed resume data
   */
  async parseResumeAndCreateCandidate(
    createFileData: any,
    userId: string,
    organizationId: string,
  ): Promise<Candidate> {
    // Parse the resume using document ID
    const { dataForSave } = await this.resumeParserService.parseResume(
      createFileData,
      userId,
      organizationId,
    );
    // Create a new candidate with the parsed data
    const createCandidateDto: CreateCandidateDto = {
      firstName: dataForSave.firstName || '',
      lastName: dataForSave.lastName || '',
      email: dataForSave.email || '',
      phone: dataForSave.phone || '',
      currentPosition: dataForSave.currentPosition || '',
      expectedPosition: dataForSave.expectedPosition || '',
      resume: {
        rawText: dataForSave.resume,
        structuredData: dataForSave.structuredResume,
        jobMatching: dataForSave.jobMatching,
        recommendations: dataForSave.recommendations,
        metadata: dataForSave.metadata || {},
      },
    };

    // Create and return the candidate
    return await this.create(createCandidateDto);
  }
}
