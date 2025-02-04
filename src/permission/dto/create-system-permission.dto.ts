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
  @IsUUID(undefined, { message: 'Category ID must be a valid UUID.' })
  categoryId: string;

  @ApiProperty({ description: 'Resource the permission applies to' })
  @IsString({ message: 'Resource must be a string.' })
  @MinLength(3, { message: 'Resource must be at least 3 characters long.' })
  @MaxLength(255, { message: 'Resource cannot be longer than 255 characters.' })
  resource: string;

  @ApiProperty({ description: 'Unique key for the permission' })
  @IsString({ message: 'Permission key must be a string.' })
  @MinLength(3, {
    message: 'Permission key must be at least 3 characters long.',
  })
  @MaxLength(255, {
    message: 'Permission key cannot be longer than 255 characters.',
  })
  permissionKey: string;

  @ApiProperty({ description: 'Display name for the permission' })
  @IsString({ message: 'Display name must be a string.' })
  @MinLength(3, { message: 'Display name must be at least 3 characters long.' })
  @MaxLength(255, {
    message: 'Display name cannot be longer than 255 characters.',
  })
  displayName: string;

  @ApiProperty({
    description: 'Description of the permission',
    required: false,
  })
  @IsString({ message: 'Description must be a string.' })
  @IsOptional()
  @MaxLength(255, {
    message: 'Description cannot be longer than 255 characters.',
  })
  description?: string;

  @ApiProperty({
    description: 'Whether this is a base permission',
    default: false,
  })
  @IsBoolean({ message: 'isBasePermission must be a boolean value.' })
  @IsOptional()
  isBasePermission?: boolean;
}
