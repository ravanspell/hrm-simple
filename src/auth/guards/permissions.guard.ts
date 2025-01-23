import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { PERMISSIONS_KEY } from 'src/decorators/permissions.decorator';
import { UserWithScopes } from '@/user/user.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  private ERROR_TYPE = 'PERMISSION';

  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const currentUser = context.switchToHttp().getRequest()
      .user as UserWithScopes;
    // get current user scopes
    const userPermissions = currentUser?.scopes || [];
    const requiredPermissions =
      this.reflector.get<string[]>(PERMISSIONS_KEY, context.getHandler()) || [];
    // ignore permission check if no permissions defined
    if (requiredPermissions.length === 0) {
      return true;
    }
    const hasAllRequiredPermissions = requiredPermissions.every((permission) =>
      userPermissions.includes(permission),
    );
    if (hasAllRequiredPermissions) {
      return true;
    }
    throw new UnauthorizedException(
      "User don't have access for this functionality",
      { description: this.ERROR_TYPE }
    );
  }
}
