import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsOptional, IsBoolean } from 'class-validator';

export class AssignUserDirectPermissionDto {
  @ApiProperty({ description: 'User ID' })
  @IsUUID()
  userId: string;

  @ApiProperty({ description: 'System Permission ID' })
  @IsUUID()
  systemPermissionId: string;

  @ApiProperty({ description: 'Organization ID' })
  @IsUUID()
  organizationId: string;

  @ApiProperty({
    description: 'Whether this is an override permission',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isOverride?: boolean;
}
