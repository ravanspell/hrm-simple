import { SetMetadata } from '@nestjs/common';

export const IS_AUTH_REQUIRED = 'authRequired';
/**
 * Enforce user authentication on the API.
 * @returns void
 */
export const Authentication = () => SetMetadata(IS_AUTH_REQUIRED, true);
