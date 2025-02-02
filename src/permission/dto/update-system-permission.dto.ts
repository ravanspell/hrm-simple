import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsUUID,
  IsOptional,
  IsBoolean,
  MinLength,
  MaxLength,
} from 'class-validator';

export class UpdateSystemPermissionDto {
  @ApiProperty({
    description: 'Display name for the permission',
    required: false,
  })
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  @IsOptional()
  displayName?: string;

  @ApiProperty({
    description: 'Description of the permission',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Whether this is a base permission',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isBasePermission?: boolean;

  @ApiProperty({
    description: 'Category ID for the permission',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  categoryId?: string;
}
