/**
 * Controller for managing job posting endpoints.
 * Provides REST API endpoints for job creation, management, and retrieval.
 * Includes both authenticated and public endpoints.
 */
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  Put,
  HttpStatus,
  Req,
  Version,
} from '@nestjs/common';
import { JobService } from './job.service';
import { CreateJobDto } from './dto/create-job.dto';
import { Job } from './entities/job.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { RequestWithTenant } from '@/coretypes';
import { Authentication } from '@/decorators/auth.decorator';
import { API_VERSION } from '@/constants/common';

@ApiTags('Job postings')
@Controller('jobs')
export class JobController {
  constructor(private readonly jobService: JobService) {}

  /**
   * Creates a new job posting.
   * Requires authentication and sets the organization from the authenticated user.
   */
  @Post()
  @Authentication()
  @Version(API_VERSION.V1)
  @ApiOperation({ summary: 'Create a new job posting' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The job has been successfully created.',
    type: Job,
  })
  async createJob(
    @Req() req: RequestWithTenant,
    @Body() createJobDto: CreateJobDto,
  ): Promise<Job> {
    return this.jobService.createJob(
      req.user.organizationId,
      req.user.id,
      createJobDto,
    );
  }

  /**
   * Retrieves all jobs for the authenticated organization.
   * Includes pagination support.
   */
  @Get()
  @Authentication()
  @Version(API_VERSION.V1)
  @ApiOperation({ summary: 'Get all jobs for the organization' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of jobs for the organization.',
    type: [Job],
  })
  async getOrganizationJobs(
    @Req() req: RequestWithTenant,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<{ jobs: Job[]; total: number }> {
    return this.jobService.getJobsByOrganization(
      req.user.organizationId,
      page,
      limit,
    );
  }

  /**
   * Public endpoint to retrieve all published jobs.
   * Accessible without authentication.
   * Includes pagination support.
   */
  @Get('public')
  @Version(API_VERSION.V1)
  @ApiOperation({ summary: 'Get all published jobs' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of published jobs.',
    type: [Job],
  })
  async getPublishedJobs(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<{ jobs: Job[]; total: number }> {
    return this.jobService.getPublishedJobs(page, limit);
  }

  /**
   * Retrieves a specific job by its ID.
   * Public endpoint that returns both published and unpublished jobs.
   */
  @Get(':id')
  @Version(API_VERSION.V1)
  @ApiOperation({ summary: 'Get a job by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The job details.',
    type: Job,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Job not found.',
  })
  async getJob(@Param('id') id: string): Promise<Job> {
    return this.jobService.getJobById(id);
  }

  /**
   * Changes a job's status to PUBLISHED.
   * Requires authentication and organization membership.
   */
  @Put(':id/publish')
  @Authentication()
  @Version(API_VERSION.V1)
  @ApiOperation({ summary: 'Publish a job' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The job has been published.',
    type: Job,
  })
  async publishJob(
    @Param('id') id: string,
    @Req() req: RequestWithTenant,
  ): Promise<Job> {
    return this.jobService.publishJob(id, req.user.id);
  }

  /**
   * Changes a job's status to UNPUBLISHED.
   * Requires authentication and organization membership.
   */
  @Put(':id/unpublish')
  @Authentication()
  @Version(API_VERSION.V1)
  @ApiOperation({ summary: 'Unpublish a job' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The job has been unpublished.',
    type: Job,
  })
  async unpublishJob(
    @Param('id') id: string,
    @Req() req: RequestWithTenant,
  ): Promise<Job> {
    return this.jobService.unpublishJob(id, req.user.id);
  }

  /**
   * Permanently deletes a job posting.
   * Requires authentication and organization membership.
   */
  @Delete(':id')
  @Authentication()
  @Version(API_VERSION.V1)
  @ApiOperation({ summary: 'Delete a job' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'The job has been deleted.',
  })
  async deleteJob(@Param('id') id: string): Promise<void> {
    return this.jobService.deleteJob(id);
  }
}
