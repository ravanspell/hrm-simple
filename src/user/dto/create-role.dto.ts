import { IsString, IsOptional, IsUUID, IsArray } from 'class-validator';

/**
 * DTO for creating a new role.
 */
export class CreateRoleDto {
  /**
   * The name of the role.
   * @example "Admin"
   */
  @IsString()
  name: string;

  /**
   * A brief description of the role (optional).
   * @example "Role with full administrative privileges."
   */
  @IsString()
  @IsOptional()
  description?: string;

  /**
   * The ID of the organization the role belongs to.
   */
  @IsUUID()
  organizationId: string;

  /**
   * A list of scope IDs to associate with the role (optional).
   */
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  scopeIds?: string[];
}
