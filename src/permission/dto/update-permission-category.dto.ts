import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsInt,
  IsOptional,
  MinLength,
  MaxLength,
} from 'class-validator';

export class UpdatePermissionCategoryDto {
  @ApiProperty({
    description: 'Name of the permission category',
    required: false,
  })
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'Description of the permission category',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Display order for the category',
    required: false,
  })
  @IsInt()
  @IsOptional()
  displayOrder?: number;
}
