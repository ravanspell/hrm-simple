import { PartialType } from '@nestjs/mapped-types';
import { CreateScopeDto } from './create-scope.dto';

/**
 * DTO for updating an existing scope.
 * Extends the CreateScopeDto with optional fields.
 */
export class UpdateScopeDto extends PartialType(CreateScopeDto) {}
