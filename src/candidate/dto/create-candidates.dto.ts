import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
  ValidateNested,
  ArrayNotEmpty,
  ArrayMaxSize,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO for a single resume file in the create candidates request
 */
export class ResumeFileDto {
  @ApiProperty({
    description: 'Name of the file',
    example: 'resume.pdf',
  })
  @IsString()
  @IsNotEmpty()
  fileName: string;

  @ApiProperty({
    description: 'S3 object key for the file',
    example: '39b4115a-3f77-40de-a367-4e1c879cab89_resume.pdf',
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
    type: [ResumeFileDto],
    example: [
      {
        fileName: 'resume1.pdf',
        s3ObjectKey: '39b4115a-3f77-40de-a367-4e1c879cab89_resume1.pdf',
        fileSize: 1024,
      },
      {
        fileName: 'resume2.pdf',
        s3ObjectKey: '39b4115a-3f77-40de-a367-4e1c879cab89_resume2.pdf',
        fileSize: 2048,
      },
    ],
  })
  @IsArray()
  @ArrayNotEmpty({ message: 'At least one resume file is required' })
  @ArrayMaxSize(50, {
    message: 'Maximum 50 resume files can be processed at once',
  })
  @ValidateNested({ each: true })
  @Type(() => ResumeFileDto)
  resumeFiles: ResumeFileDto[];
}
