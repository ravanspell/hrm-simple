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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CandidateService } from './candidate.service';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { UpdateCandidateDto } from './dto/update-candidate.dto';
import { FilterCandidateDto } from './dto/filter-candidate.dto';
import { Authentication } from '../decorators/auth.decorator';
import { ResumeParserService } from './resume-parser.service';

@ApiTags('candidates')
@Authentication()
@Controller('candidates')
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

  @Post('parse-resume')
  @Authentication()
  @ApiOperation({ summary: 'Parse resume by document ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Resume parsed successfully',
  })
  async parseResume(@Body('documentId') documentId: string) {
    if (!documentId) {
      throw new BadRequestException('Document ID is required');
    }
    return this.resumeParserService.parseResume(documentId);
  }

  @Post('parse-resume-and-create')
  @ApiOperation({
    summary: 'Parse a resume by document ID and create a new candidate',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Candidate created from resume successfully.',
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request.' })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized.',
  })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden.' })
  async parseResumeAndCreate(@Body('documentId') documentId: string) {
    if (!documentId) {
      throw new BadRequestException('Document ID is required');
    }
    return await this.candidateService.parseResumeAndCreateCandidate(
      documentId,
    );
  }

  @Post(':id/parse-resume-and-update')
  @ApiOperation({
    summary: 'Parse a resume by document ID and update an existing candidate',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Candidate updated from resume successfully.',
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
  async parseResumeAndUpdate(
    @Param('id') id: string,
    @Body('documentId') documentId: string,
  ) {
    if (!documentId) {
      throw new BadRequestException('Document ID is required');
    }
    return await this.candidateService.parseResumeAndUpdateCandidate(
      id,
      documentId,
    );
  }
}
