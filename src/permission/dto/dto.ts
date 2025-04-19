import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsUUID,
  IsInt,
  IsOptional,
  IsBoolean,
  IsDate,
  MinLength,
  MaxLength,
} from 'class-validator';

export class CreatePermissionCategoryDto {
  @ApiProperty({ description: 'Name of the permission category' })
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  name: string;

  @ApiProperty({
    description: 'Description of the permission category',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Display order for the category' })
  @IsOptional()
  @IsInt()
  displayOrder?: number;
}

export class PermissionCategoryResponseDto {
  @ApiProperty({ description: 'Unique identifier of the category' })
  id: string;

  @ApiProperty({ description: 'Name of the permission category' })
  name: string;

  @ApiProperty({ description: 'Description of the permission category' })
  description?: string;

  @ApiProperty({ description: 'Display order for the category' })
  displayOrder: number;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;
}

export class UpdateOrganizationLicensedPermissionDto {
  @ApiProperty({
    description: 'Whether the permission is active',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ description: 'Valid until date', required: false })
  @IsDate()
  @IsOptional()
  validUntil?: Date;
}

export class UpdateUserDirectPermissionDto {
  @ApiProperty({
    description: 'Whether this is an override permission',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isOverride?: boolean;
}

export class PaginationQueryDto {
  @ApiProperty({ description: 'Page number', minimum: 1, default: 1 })
  @IsInt()
  @IsOptional()
  page?: number = 1;

  @ApiProperty({
    description: 'Items per page',
    minimum: 1,
    maximum: 100,
    default: 10,
  })
  @IsInt()
  @IsOptional()
  limit?: number = 10;
}

export class PermissionQueryDto extends PaginationQueryDto {
  @ApiProperty({
    description: 'Search term for permission name or description',
    required: false,
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiProperty({ description: 'Filter by category ID', required: false })
  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @ApiProperty({ description: 'Filter by resource', required: false })
  @IsString()
  @IsOptional()
  resource?: string;

  @ApiProperty({ description: 'Filter base permissions only', required: false })
  @IsBoolean()
  @IsOptional()
  basePermissionsOnly?: boolean;
}

export class BulkAssignPermissionsDto {
  @ApiProperty({ description: 'Organization ID' })
  @IsUUID()
  organizationId: string;

  @ApiProperty({
    description: 'Array of system permission IDs',
    type: [String],
  })
  @IsUUID(undefined, { each: true })
  systemPermissionIds: string[];

  @ApiProperty({ description: 'Valid from date' })
  @IsDate()
  validFrom: Date;

  @ApiProperty({ description: 'Valid until date', required: false })
  @IsDate()
  @IsOptional()
  validUntil?: Date;
}

export class BulkAssignUserDirectPermissionsDto {
  @ApiProperty({ description: 'User ID' })
  @IsUUID()
  userId: string;

  @ApiProperty({ description: 'Organization ID' })
  @IsUUID()
  organizationId: string;

  @ApiProperty({
    description: 'Array of system permission IDs',
    type: [String],
  })
  @IsUUID(undefined, { each: true })
  systemPermissionIds: string[];

  @ApiProperty({
    description: 'Whether these are override permissions',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isOverride?: boolean;
}

export * from './create-system-permission.dto';
