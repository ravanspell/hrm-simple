import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { User } from '@prisma/client';
import { Observable } from 'rxjs';
import { PERMISSIONS_KEY } from 'src/decorators/permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const currentUser = context.switchToHttp().getRequest().user as User;
    const userPermissions = ['can:filter'];
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
    );
  }
}
