import { SetMetadata } from '@nestjs/common';

export const IS_AUTH_REQUIRED = 'authRequired';
/**
 * Enforce user authentication on the API.
 * This decorator will activate the auth guard that ensures the user is authenticated. src/auth/guards/authenticated.guard.ts
 * after authentication the user object will be injected into the request object.
 *
 * @returns void
 */
export const Authentication = () => SetMetadata(IS_AUTH_REQUIRED, true);
