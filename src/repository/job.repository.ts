/**
 * Repository for managing job-related database operations.
 * Handles CRUD operations and data access for job postings.
 */
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Job, JobStatus } from '@/job/entities/job.entity';
import { CreateJobDto } from '@/job/dto/create-job.dto';

@Injectable()
export class JobRepository extends Repository<Job> {
  constructor(dataSource: DataSource) {
    super(Job, dataSource.createEntityManager());
  }

  /**
   * Creates a new job posting in the database.
   *
   * @param organizationId - The ID of the organization creating the job
   * @param userId - The ID of the user creating the job
   * @param createJobDto - The data for creating the job
   * @returns A promise that resolves to the created job entity
   */
  async createJob(
    organizationId: string,
    userId: string,
    createJobDto: CreateJobDto,
  ): Promise<Job> {
    const job = this.create({
      ...createJobDto,
      organizationId,
      createdBy: userId,
      updatedBy: userId,
      status: JobStatus.DRAFT,
    });
    return this.save(job);
  }

  /**
   * Retrieves jobs for a specific organization with pagination.
   *
   * @param organizationId - The ID of the organization
   * @param page - The page number for pagination (1-based)
   * @param limit - The number of items per page
   * @returns A promise that resolves to an object containing jobs and total count
   */
  async findJobsByOrganization(
    organizationId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ jobs: Job[]; total: number }> {
    const [jobs, total] = await this.findAndCount({
      where: { organizationId },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
      relations: ['creator', 'updater'],
    });

    return { jobs, total };
  }

  /**
   * Retrieves all published jobs with pagination.
   * Used for public job listings.
   *
   * @param page - The page number for pagination (1-based)
   * @param limit - The number of items per page
   * @returns A promise that resolves to an object containing jobs and total count
   */
  async findPublishedJobs(
    page: number = 1,
    limit: number = 10,
  ): Promise<{ jobs: Job[]; total: number }> {
    const [jobs, total] = await this.findAndCount({
      where: { status: JobStatus.PUBLISHED },
      skip: (page - 1) * limit,
      take: limit,
      order: { publishedAt: 'DESC' },
      relations: ['organization'],
    });

    return { jobs, total };
  }

  /**
   * Updates the status of a job posting.
   *
   * @param jobId - The ID of the job to update
   * @param status - The new status to set
   * @param userId - The ID of the user making the update
   * @returns A promise that resolves to the updated job entity or null if not found
   */
  async updateJobStatus(
    jobId: string,
    status: JobStatus,
    userId: string,
  ): Promise<Job> {
    const job = await this.findOne({ where: { id: jobId } });
    if (job) {
      job.status = status;
      job.updatedBy = userId;
      if (status === JobStatus.PUBLISHED) {
        job.publishedAt = new Date();
      }
      return this.save(job);
    }
    return null;
  }
}
