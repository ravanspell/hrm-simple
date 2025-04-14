import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Min,
  IsBoolean,
  IsDate,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateJobDto {
  @ApiProperty({
    example: 'Senior Software Engineer',
    description: 'The title of the job posting',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: {
      content: 'Rich text content of the job description',
      format: 'html',
    },
    description: 'The rich text description of the job',
  })
  @IsObject()
  @IsNotEmpty()
  description: object;

  @ApiProperty({
    example: 50000,
    description: 'The minimum salary for the position',
    required: false,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  salaryMin?: number;

  @ApiProperty({
    example: 80000,
    description: 'The maximum salary for the position',
    required: false,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  salaryMax?: number;

  @ApiProperty({
    example: 'London, UK',
    description: 'The location of the job',
    required: false,
  })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiProperty({
    example: 'Technology',
    description: 'The industry category of the job',
    required: false,
  })
  @IsString()
  @IsOptional()
  industry?: string;

  @ApiProperty({
    example: '5+ years',
    description: 'Required years of experience',
    required: false,
  })
  @IsString()
  @IsOptional()
  experienceRequired?: string;

  @ApiProperty({
    example: "Bachelor's Degree",
    description: 'Required education level',
    required: false,
  })
  @IsString()
  @IsOptional()
  educationRequired?: string;

  @ApiProperty({
    example: true,
    description: 'Whether visa sponsorship is available',
    required: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  sponsorshipConsidered?: boolean;

  @ApiProperty({
    example: '2024-12-31',
    description: 'The date when the job posting expires',
    required: false,
  })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  expiresAt?: Date;

  @ApiProperty({
    example: true,
    description: 'Whether the job is remote',
    required: false,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isRemote?: boolean;
}
