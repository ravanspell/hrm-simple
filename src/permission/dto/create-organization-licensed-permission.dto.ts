import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsOptional, IsBoolean, IsDate } from 'class-validator';

export class CreateOrganizationLicensedPermissionDto {
  @ApiProperty({ description: 'Organization ID' })
  @IsUUID()
  organizationId: string;

  @ApiProperty({ description: 'System Permission ID' })
  @IsUUID()
  systemPermissionId: string;

  @ApiProperty({
    description: 'Whether the permission is active',
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ description: 'Valid from date' })
  @IsDate()
  validFrom: Date;

  @ApiProperty({ description: 'Valid until date', required: false })
  @IsDate()
  @IsOptional()
  validUntil?: Date;
}
