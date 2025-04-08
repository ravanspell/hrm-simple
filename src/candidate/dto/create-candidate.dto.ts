import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  IsOptional,
  IsUrl,
  IsEnum,
  IsObject,
} from 'class-validator';

export class CreateCandidateDto {
  @ApiProperty({ description: 'First name of the candidate' })
  @IsString()
  firstName: string;

  @ApiProperty({ description: 'Last name of the candidate' })
  @IsString()
  lastName: string;

  @ApiProperty({ description: 'Email address of the candidate' })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Phone number of the candidate',
    required: false,
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({
    description: 'Current position of the candidate',
    required: false,
  })
  @IsString()
  @IsOptional()
  currentPosition?: string;

  @ApiProperty({
    description: 'Expected position the candidate is applying for',
    required: false,
  })
  @IsString()
  @IsOptional()
  expectedPosition?: string;

  @ApiProperty({
    description: 'Resume/CV content of the candidate',
    required: false,
  })
  @IsString()
  @IsOptional()
  resume?: string;

  @ApiProperty({
    description: 'LinkedIn profile URL of the candidate',
    required: false,
  })
  @IsUrl()
  @IsOptional()
  linkedInUrl?: string;

  @ApiProperty({
    description: 'Current status of the candidate application',
    enum: [
      'PENDING',
      'REVIEWING',
      'INTERVIEWED',
      'OFFERED',
      'REJECTED',
      'HIRED',
    ],
    default: 'PENDING',
  })
  @IsEnum([
    'PENDING',
    'REVIEWING',
    'INTERVIEWED',
    'OFFERED',
    'REJECTED',
    'HIRED',
  ])
  @IsOptional()
  status?: string;

  @ApiProperty({
    description: 'Additional metadata about the candidate',
    required: false,
  })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
