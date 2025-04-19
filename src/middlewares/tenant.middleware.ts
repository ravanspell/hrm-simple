import { TenantContext } from '@/tenant/tenant-context';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to set the tenant ID in the tenant context
 */
@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private readonly tenantContext: TenantContext) {}

  use(req: Request, res: Response, next: NextFunction) {
    // Get the user from the request (set by Passport)
    const user = req.user as any;

    if (user && user.organizationId) {
      // Set the organization ID in the tenant context
      this.tenantContext.setCurrentTenantId(user.organizationId);
    }
    next();
  }
}
