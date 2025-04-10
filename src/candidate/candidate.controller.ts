import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpStatus,
  BadRequestException,
  Req,
  Version,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CandidateService } from './candidate.service';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { UpdateCandidateDto } from './dto/update-candidate.dto';
import { FilterCandidateDto } from './dto/filter-candidate.dto';
import { Authentication } from '../decorators/auth.decorator';
import { ResumeParserService } from './resume-parser.service';
import { Candidate } from './entities/candidate.entity';
import { RequestWithTenant } from '@/coretypes';
import { createFileData } from '@/file-management/file-management.service';
import { API_VERSION } from '@/constants/common';
import { CreateCandidatesDto } from './dto/create-candidates.dto';

@ApiTags('candidates')
@Controller('candidate')
@Authentication()
export class CandidateController {
  constructor(
    private readonly candidateService: CandidateService,
    private readonly resumeParserService: ResumeParserService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new candidate' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The candidate has been successfully created.',
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request.' })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized.',
  })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden.' })
  async create(@Body() createCandidateDto: CreateCandidateDto) {
    return this.candidateService.create(createCandidateDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all candidates with filtering and pagination' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Return all candidates.' })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized.',
  })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden.' })
  findAll(@Query() filter: FilterCandidateDto) {
    return this.candidateService.findAll(filter);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a candidate by id' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Return the candidate.' })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized.',
  })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden.' })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Candidate not found.',
  })
  findOne(@Param('id') id: string) {
    return this.candidateService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a candidate' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The candidate has been successfully updated.',
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request.' })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized.',
  })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden.' })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Candidate not found.',
  })
  update(
    @Param('id') id: string,
    @Body() updateCandidateDto: UpdateCandidateDto,
  ) {
    return this.candidateService.update(id, updateCandidateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a candidate' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The candidate has been successfully deleted.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized.',
  })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden.' })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Candidate not found.',
  })
  remove(@Param('id') id: string) {
    return this.candidateService.remove(id);
  }

  /**
   * Parse a resume by document ID
   * @param createFileData - The file data of the resume to parse
   * @param req - The request object containing the user and organization
   * @returns The parsed resume data
   */
  @Post('parse-resume')
  @ApiOperation({ summary: 'Parse resume by document ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Resume parsed successfully',
  })
  async parseResume(
    @Body('createFileData') createFileData: createFileData,
    @Req() req: RequestWithTenant,
  ) {
    const { user, organization } = req;
    if (!createFileData) {
      throw new BadRequestException('Document ID is required');
    }
    return this.resumeParserService.parseResume(
      createFileData,
      user.id,
      organization.id,
    );
  }

  /**
   * Create candidates with resume files and queue them for parsing
   * @param createCandidatesDto - The file data of the resumes to parse
   * @param req - The request object containing the user and organization
   * @returns The created candidates
   */
  @Post('create-candidates')
  @Version(API_VERSION.V1)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create candidates with resume files and queue them for parsing',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description:
      'The candidates have been successfully created and queued for parsing.',
    type: [Candidate],
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request.' })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized.',
  })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden.' })
  async createCandidatesWithResumeParsing(
    @Body() createCandidatesDto: CreateCandidatesDto,
    @Req() req: RequestWithTenant,
  ): Promise<any> {
    const { user } = req;
    const organizationId = user.organizationId;
    const userId = user.id;

    // Create candidates with dummy data and queue them for parsing
    return this.candidateService.createCandidatesWithResumeParsing(
      createCandidatesDto.resumeFiles,
      userId,
      organizationId,
    );
  }
}
