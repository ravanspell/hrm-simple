import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsUUID,
  IsOptional,
  IsBoolean,
  MinLength,
  MaxLength,
} from 'class-validator';

export class CreateSystemPermissionDto {
  @ApiProperty({ description: 'Category ID for the permission' })
  @IsUUID()
  categoryId: string;

  @ApiProperty({ description: 'Resource the permission applies to' })
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  resource: string;

  @ApiProperty({ description: 'Unique key for the permission' })
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  permissionKey: string;

  @ApiProperty({ description: 'Display name for the permission' })
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  displayName: string;

  @ApiProperty({
    description: 'Description of the permission',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Whether this is a base permission',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isBasePermission?: boolean;
}
