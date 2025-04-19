import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsUUID,
  IsOptional,
  IsBoolean,
  MinLength,
  MaxLength,
  IsNotEmpty,
} from 'class-validator';

export class CreateSystemPermissionDto {
  @ApiProperty({
    description: 'Unique key for the permission',
    example: 'user.create',
  })
  @IsNotEmpty()
  @IsString()
  permissionKey: string;

  @ApiProperty({
    description: 'Display name of the permission',
    example: 'Create User',
  })
  @IsNotEmpty()
  @IsString()
  displayName: string;

  @ApiProperty({
    description: 'Description of what the permission allows',
    example: 'Allows creating new users in the system',
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({
    description: 'ID of the permission category',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  @IsUUID()
  categoryId: string;

  @ApiProperty({ description: 'Resource the permission applies to' })
  @IsString({ message: 'Resource must be a string.' })
  @MinLength(3, { message: 'Resource must be at least 3 characters long.' })
  @MaxLength(255, { message: 'Resource cannot be longer than 255 characters.' })
  resource: string;

  @ApiProperty({
    description: 'Whether this is a base permission',
    default: false,
  })
  @IsBoolean({ message: 'isBasePermission must be a boolean value.' })
  @IsOptional()
  isBasePermission?: boolean;
}
