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
import { Candidate } from './entities/candidate.entity';

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
  @ApiOperation({ summary: 'Parse resumes and create candidates' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The candidates have been successfully created.',
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request.' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden.' })
  async parseResumeAndCreate(
    @Body('documentIds') documentIds: string[],
  ): Promise<Candidate[]> {
    if (
      !documentIds ||
      !Array.isArray(documentIds) ||
      documentIds.length === 0
    ) {
      throw new BadRequestException('Document IDs array is required');
    }

    // Parse all resumes in parallel
    const parseResults = await Promise.allSettled(
      documentIds.map((documentId) =>
        this.resumeParserService.parseResume(documentId),
      ),
    );

    // Process results and create candidates
    const candidates: Candidate[] = [];
    const errors: string[] = [];

    for (let i = 0; i < parseResults.length; i++) {
      const result = parseResults[i];
      const documentId = documentIds[i];

      if (result.status === 'fulfilled') {
        try {
          // Create candidate from parsed data
          const candidate = await this.candidateService.create({
            firstName: result.value.firstName || '',
            lastName: result.value.lastName || '',
            email: result.value.email || '',
            phone: result.value.phone || '',
            currentPosition: result.value.currentPosition || '',
            expectedPosition: result.value.expectedPosition || '',
            resume: result.value.resume,
            metadata: {
              ...result.value.metadata,
              documentId,
              parsedAt: new Date().toISOString(),
            },
          });
          candidates.push(candidate);
        } catch (error) {
          errors.push(
            `Failed to create candidate for document ${documentId}: ${error.message}`,
          );
        }
      } else {
        errors.push(
          `Failed to parse resume for document ${documentId}: ${result.reason}`,
        );
      }
    }

    // If there were any errors, include them in the response
    if (errors.length > 0) {
      // You might want to handle this differently based on your requirements
      console.error('Errors during resume parsing:', errors);
    }

    return candidates;
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
