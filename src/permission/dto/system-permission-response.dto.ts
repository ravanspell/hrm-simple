import { ApiProperty } from '@nestjs/swagger';

export class PermissionDto {
  @ApiProperty({
    description: 'Display name of the permission',
    example: 'Create Job',
  })
  displayName: string;

  @ApiProperty({
    description: 'Permission string in format TYPE:RESOURCE',
    example: 'CREATE:JOB',
  })
  permission: string;

  @ApiProperty({
    description: 'ID of the permission',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  permissionId: string;
}

export class SystemPermissionResponseDto {
  @ApiProperty({
    description: 'Category of the permission',
    example: 'Job',
  })
  category: string;

  @ApiProperty({
    description: 'ID of the permission category',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  categoryId: string;

  @ApiProperty({
    description: 'List of permissions in this category',
    type: [PermissionDto],
  })
  permissions: PermissionDto[];
}
