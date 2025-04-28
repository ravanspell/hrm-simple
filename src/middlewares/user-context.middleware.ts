import { Injectable, NestMiddleware } from '@nestjs/common';
import { AsyncStorageService } from '@/utilities/async-storage-service/async-storage.service';
import { User } from '@/user/entities/user.entity';
import { USER_CONTEXT_KEY } from '@/constants/common';

/**
 * Middleware to set the user context into async storage
 * this will be usefull to access to current user in the request form
 * any part of the application
 */
@Injectable()
export class UserContextMiddleware implements NestMiddleware {
  constructor(private readonly asyncStorageService: AsyncStorageService) {}

  use(req: any, _res: any, next: () => void) {
    const user = req.user as User;
    if (user) {
      this.asyncStorageService.set(USER_CONTEXT_KEY, user);
    }
    next();
  }
}
