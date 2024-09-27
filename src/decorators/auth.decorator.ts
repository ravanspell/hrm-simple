import { SetMetadata } from '@nestjs/common';

export const IS_AUTH_REQUIRED = 'authRequired';

export const Authentication = () => SetMetadata(IS_AUTH_REQUIRED, true);
