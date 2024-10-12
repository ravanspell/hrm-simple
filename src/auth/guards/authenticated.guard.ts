import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { IS_AUTH_REQUIRED } from 'src/decorators/auth.decorator';
import { RequestWithTenant } from 'src/coretypes';

@Injectable()
export class AuthenticatedGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const isAuthRequired = this.reflector.get<string[]>(IS_AUTH_REQUIRED, context.getHandler());
        
        if (isAuthRequired) {
            const request = context.switchToHttp().getRequest<RequestWithTenant>();
            if (request.isAuthenticated && request.isAuthenticated()) {
                // Assuming Passport attaches user to request
                if (!request.user) {
                    throw new UnauthorizedException('User not found in session');
                }
                // Optionally, validate that the user has an associated organization
                if (!request.user.organizationId) {
                    throw new UnauthorizedException('User is not associated with any organization');
                }
                return true;
            }
            throw new UnauthorizedException('User is not authenticated');
        }
        return true;
    }
}