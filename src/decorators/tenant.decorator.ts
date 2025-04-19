import {
  createParamDecorator,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';
import { TenantService } from '../utilities/tenant-service/tenant.service';

/**
 * Decorator to extract the organization ID from the tenant context.
 * This decorator can be used in controllers and services to access the organization ID.
 *
 * @example
 * ```typescript
 * @Get()
 * findAll(@TenantId() organizationId: string) {
 *   return this.service.findAll(organizationId);
 * }
 * ```
 */
export const TenantId = createParamDecorator(
  (_data: unknown, _ctx: ExecutionContext) => {
    const organizationId = TenantService.getCurrentTenantId();

    if (!organizationId) {
      throw new BadRequestException(
        'Organization ID not found in tenant context. Make sure the TenantMiddleware is applied and the user has an organizationId.',
      );
    }

    return organizationId;
  },
);
