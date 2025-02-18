import { IsString, IsOptional, IsUUID, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRoleDto {
  /**
   * The name of the role.
   * @example "Admin"
   */
  @ApiProperty({
    description: 'The name of the role.',
    example: 'Admin',
  })
  @IsString()
  name: string;

  /**
   * A brief description of the role (optional).
   * @example "Role with full administrative privileges."
   */
  @ApiPropertyOptional({
    description: 'A brief description of the role.',
    example: 'Role with full administrative privileges.',
  })
  @IsString()
  @IsOptional()
  description?: string;
  /**
   * A list of scope IDs to associate with the role (optional).
   */
  @ApiPropertyOptional({
    description: 'A list of scope IDs to associate with the role.',
    example: [
      '550e8400-e29b-41d4-a716-446655440001',
      '550e8400-e29b-41d4-a716-446655440002',
    ],
    type: [String],
  })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  scopeIds?: string[];
}
