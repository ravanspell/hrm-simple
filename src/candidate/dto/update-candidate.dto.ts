import { PartialType } from '@nestjs/swagger';
import { CreateCandidateDto } from './create-candidate.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsObject, IsEnum } from 'class-validator';

export class UpdateCandidateDto extends PartialType(CreateCandidateDto) {
  @ApiProperty({
    description: 'Expected position the candidate is applying for',
    required: false,
  })
  @IsString()
  @IsOptional()
  expectedPosition?: string;

  @ApiProperty({
    description: 'Resume/CV content of the candidate in JSON format',
    required: false,
  })
  @IsObject()
  @IsOptional()
  resume?: Record<string, any>;

  @ApiProperty({
    description: 'Current status of the candidate application',
    enum: [
      'PENDING',
      'REVIEWING',
      'INTERVIEWED',
      'OFFERED',
      'REJECTED',
      'HIRED',
      'IDLE',
      'PROCESSING',
    ],
    default: 'REVIEWING',
  })
  @IsEnum([
    'PENDING',
    'REVIEWING',
    'INTERVIEWED',
    'OFFERED',
    'REJECTED',
    'HIRED',
    'IDLE',
    'PROCESSING',
  ])
  @IsOptional()
  status?: string;
}
