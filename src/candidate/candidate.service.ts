import { Injectable, BadRequestException } from '@nestjs/common';
import { CandidateRepository } from './candidate.repository';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { UpdateCandidateDto } from './dto/update-candidate.dto';
import { FilterCandidateDto } from './dto/filter-candidate.dto';
import { Candidate } from './entities/candidate.entity';

/**
 * Service responsible for managing candidate data and operations
 * Provides business logic for CRUD operations on candidates
 */
@Injectable()
export class CandidateService {
  constructor(private readonly candidateRepository: CandidateRepository) {}

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
}
