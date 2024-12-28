import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  async canActivate(context: ExecutionContext) {
    const result = (await super.canActivate(context)) as boolean;
    const request = context.switchToHttp().getRequest();
    // Ensure req.user exists before calling super.logIn()
    if (result && request.user) {
      await super.logIn(request); // This should call req.login internally
    }
    return result;
  }
}
