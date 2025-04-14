/**
 * Service responsible for managing job postings business logic.
 * Handles job creation, status updates, and retrieval operations.
 */
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JobRepository } from '@/repository/job.repository';
import { CreateJobDto } from './dto/create-job.dto';
import { Job, JobStatus } from './entities/job.entity';
import { Transactional } from 'typeorm-transactional';

@Injectable()
export class JobService {
  constructor(private readonly jobRepository: JobRepository) {}

  /**
   * Creates a new job posting.
   * Initial status is set to DRAFT.
   *
   * @param organizationId - The ID of the organization creating the job
   * @param userId - The ID of the user creating the job
   * @param createJobDto - The data for creating the job
   * @returns A promise that resolves to the created job
   */
  @Transactional()
  async createJob(
    organizationId: string,
    userId: string,
    createJobDto: CreateJobDto,
  ): Promise<Job> {
    return this.jobRepository.createJob(organizationId, userId, createJobDto);
  }

  /**
   * Retrieves all jobs for a specific organization with pagination.
   *
   * @param organizationId - The ID of the organization
   * @param page - The page number (1-based)
   * @param limit - The number of items per page
   * @returns A promise that resolves to paginated jobs and total count
   */
  async getJobsByOrganization(
    organizationId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ jobs: Job[]; total: number }> {
    return this.jobRepository.findJobsByOrganization(
      organizationId,
      page,
      limit,
    );
  }

  /**
   * Retrieves all published jobs with pagination.
   * These jobs are visible to the public.
   *
   * @param page - The page number (1-based)
   * @param limit - The number of items per page
   * @returns A promise that resolves to paginated jobs and total count
   */
  async getPublishedJobs(
    page: number = 1,
    limit: number = 10,
  ): Promise<{ jobs: Job[]; total: number }> {
    return this.jobRepository.findPublishedJobs(page, limit);
  }

  /**
   * Retrieves a specific job by its ID.
   * Includes relations with organization, creator, and updater.
   *
   * @param jobId - The ID of the job to retrieve
   * @throws NotFoundException if the job is not found
   * @returns A promise that resolves to the job entity
   */
  async getJobById(jobId: string): Promise<Job> {
    const job = await this.jobRepository.findOne({
      where: { id: jobId },
      relations: ['organization', 'creator', 'updater'],
    });

    if (!job) {
      throw new NotFoundException(`Job with ID "${jobId}" not found`);
    }

    return job;
  }

  /**
   * Changes a job's status to PUBLISHED.
   * Updates the publishedAt timestamp.
   *
   * @param jobId - The ID of the job to publish
   * @param userId - The ID of the user making the change
   * @throws NotFoundException if the job is not found
   * @returns A promise that resolves to the updated job
   */
  @Transactional()
  async publishJob(jobId: string, userId: string): Promise<Job> {
    const updatedJob = await this.jobRepository.updateJobStatus(
      jobId,
      JobStatus.PUBLISHED,
      userId,
    );

    if (!updatedJob) {
      throw new NotFoundException(`Job with ID "${jobId}" not found`);
    }

    return updatedJob;
  }

  /**
   * Changes a job's status to UNPUBLISHED.
   * Removes the job from public view.
   *
   * @param jobId - The ID of the job to unpublish
   * @param userId - The ID of the user making the change
   * @throws BadRequestException if the job is not found
   * @returns A promise that resolves to the updated job
   */
  @Transactional()
  async unpublishJob(jobId: string, userId: string): Promise<Job> {
    const updatedJob = await this.jobRepository.updateJobStatus(
      jobId,
      JobStatus.UNPUBLISHED,
      userId,
    );

    if (!updatedJob) {
      throw new BadRequestException(`Job with ID "${jobId}" not found`);
    }
    return updatedJob;
  }

  /**
   * Permanently deletes a job posting.
   *
   * @param jobId - The ID of the job to delete
   * @throws NotFoundException if the job is not found
   */
  @Transactional()
  async deleteJob(jobId: string): Promise<void> {
    const result = await this.jobRepository.delete(jobId);
    if (result.affected === 0) {
      throw new NotFoundException(`Job with ID "${jobId}" not found`);
    }
  }
}
