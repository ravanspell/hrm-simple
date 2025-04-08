import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';

export class FilterCandidateDto {
  @ApiProperty({ description: 'Search by first name', required: false })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiProperty({ description: 'Search by last name', required: false })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiProperty({ description: 'Search by email', required: false })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiProperty({ description: 'Search by current position', required: false })
  @IsString()
  @IsOptional()
  currentPosition?: string;

  @ApiProperty({ description: 'Search by expected position', required: false })
  @IsString()
  @IsOptional()
  expectedPosition?: string;

  @ApiProperty({
    description: 'Filter by status',
    enum: [
      'PENDING',
      'REVIEWING',
      'INTERVIEWED',
      'OFFERED',
      'REJECTED',
      'HIRED',
    ],
    required: false,
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

  @ApiProperty({ description: 'Page number', required: false, default: 1 })
  @Transform(({ value }) => parseInt(value))
  @IsOptional()
  page?: number = 1;

  @ApiProperty({ description: 'Items per page', required: false, default: 10 })
  @Transform(({ value }) => parseInt(value))
  @IsOptional()
  limit?: number = 10;
}
