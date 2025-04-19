import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TenantService } from '../utilities/tenant-service/tenant.service';

/**
 * Middleware to set the tenant ID in the tenant context
 */
@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private readonly tenantService: TenantService) {}

  use(req: Request, _res: Response, next: NextFunction) {
    // Get the user from the request (set by Passport)
    const user = req.user as any;

    if (user && user.organizationId) {
      // Set the organization ID in the tenant context
      this.tenantService.setCurrentTenantId(user.organizationId);
    }
    next();
  }
}
