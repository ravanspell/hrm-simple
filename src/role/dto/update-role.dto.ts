import { PartialType } from '@nestjs/mapped-types';
import { CreateRoleRequest } from './create-role.dto';

/**
 * DTO for updating an existing role.
 * Extends the CreateRoleRequest with optional fields.
 */
export class UpdateRoleRequest extends PartialType(CreateRoleRequest) {}
