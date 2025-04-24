import { USER_TRACKING_KEY } from '@/decorators/user-tracking.decorator';
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

/**
 * User tracking interceptor
 * Injects the user ID into the request body for created/updated fields
 */
@Injectable()
export class UserTrackingInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // Check if this endpoint is decorated with @TrackUser()
    const shouldTrackUser = this.reflector.get<boolean>(
      USER_TRACKING_KEY,
      context.getHandler(),
    );

    if (!shouldTrackUser) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();

    // Get user from Passport.js
    const user = request.user;

    // Skip if no authenticated user or no user ID
    if (!user || !user.id) {
      return next.handle();
    }

    // Add tracking fields based on request method
    if (request.method === 'POST') {
      if (!request.body.createdBy) {
        request.body.createdBy = user.id;
      }
      if (!request.body.updatedBy) {
        request.body.updatedBy = user.id;
      }
    } else if (request.method === 'PUT' || request.method === 'PATCH') {
      request.body.updatedBy = user.id;
    }

    return next.handle();
  }
}
