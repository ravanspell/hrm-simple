import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Decorator that extracts the current user from the request object.
 *
 * @example
 * ```typescript
 * @Get('profile')
 * getProfile(@CurrentUser() user: User) {
 *   return user;
 * }
 * ```
 */
export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    // If data is provided, return the specific property of the user
    if (data) {
      return user ? user[data] : undefined;
    }

    // Otherwise, return the entire user object
    return user;
  },
);
