import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
  ArrayNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO for a single file in the create candidates request
 */
export class FileDataDto {
  @ApiProperty({
    description: 'Name of the file',
    example: 'resume.pdf',
  })
  @IsString()
  @IsNotEmpty()
  fileName: string;

  @ApiProperty({
    description: 'ID of the parent folder (optional)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    nullable: true,
    required: false,
  })
  @IsString()
  @IsOptional()
  parentId?: string;

  @ApiProperty({
    description: 'S3 object key for the file',
    example: 'temp/uuid/resume.pdf',
  })
  @IsString()
  @IsNotEmpty()
  s3ObjectKey: string;

  @ApiProperty({
    description: 'File size in bytes',
    example: 1024,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  fileSize: number;
}

/**
 * DTO for the create candidates request
 */
export class CreateCandidatesDto {
  @ApiProperty({
    description: 'Array of resume files to parse and create candidates from',
    type: [FileDataDto],
    example: [
      {
        fileName: 'resume1.pdf',
        s3ObjectKey: 'temp/uuid/resume1.pdf',
        fileSize: 1024,
      },
      {
        fileName: 'resume2.pdf',
        s3ObjectKey: 'temp/uuid/resume2.pdf',
        fileSize: 2048,
      },
    ],
  })
  @IsArray()
  @ArrayNotEmpty({ message: 'At least one resume file is required' })
  @ValidateNested({ each: true })
  @Type(() => FileDataDto)
  resumeFiles: FileDataDto[];
}
