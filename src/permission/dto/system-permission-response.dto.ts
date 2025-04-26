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
}

export class SystemPermissionResponseDto {
  @ApiProperty({
    description: 'Category of the permission',
    example: 'Job',
  })
  category: string;

  @ApiProperty({
    description: 'List of permissions in the category',
    type: [PermissionDto],
  })
  permissions: PermissionDto[];
}
