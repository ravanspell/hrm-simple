import { PartialType } from '@nestjs/mapped-types';
import { CreateRoleDto } from '../../role/dto/create-role.dto';

/**
 * DTO for updating an existing role.
 * Extends the CreateRoleDto with optional fields.
 */
export class UpdateRoleDto extends PartialType(CreateRoleDto) {}
