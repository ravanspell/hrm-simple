import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { IS_AUTH_REQUIRED } from 'src/decorators/auth.decorator';

@Injectable()
export class AuthenticatedGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const isAuthRequired = this.reflector.get<string[]>(IS_AUTH_REQUIRED, context.getHandler())
        if (isAuthRequired) {
            const request = context.switchToHttp().getRequest();
            return request.isAuthenticated();
        }
        return true;
    }
}