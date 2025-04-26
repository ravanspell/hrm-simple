import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

export class AssignRolePermissionsDto {
  @ApiProperty({
    description: 'Array of permission IDs to assign to the role',
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  permissionIds: string[];
}
