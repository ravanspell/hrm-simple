import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { IsString, IsNumber, Min } from 'class-validator';

/**
 * DTO for a single file in the confirm upload request
 */
export class FileDataDto {
  @ApiProperty({
    description: 'Name of the file',
    example: 'document.pdf',
  })
  @IsString()
  @IsNotEmpty()
  fileName: string;

  @ApiProperty({
    description: 'ID of the parent folder (optional, use null for root)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    nullable: true,
    required: false,
  })
  @IsOptional()
  parentId?: string;

  @ApiProperty({
    description: 'S3 object key for the file in temporary storage',
    example: 'temp/uuid/document.pdf',
  })
  @IsString()
  @IsNotEmpty()
  s3ObjectKey: string;

  @ApiProperty({
    description: 'Initial file size (will be updated with actual size)',
    example: 0,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  fileSize: number;
}

/**
 * DTO for the confirm upload request
 */
export class ConfirmUploadDto {
  @ApiProperty({
    description: 'Array of files to confirm upload',
    type: [FileDataDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FileDataDto)
  files: FileDataDto[];
}
