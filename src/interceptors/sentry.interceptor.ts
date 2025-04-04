import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import * as Sentry from '@sentry/node';
import { SentryService } from '../utilities/sentry/sentry.service';

@Injectable()
export class SentryInterceptor implements NestInterceptor {
  constructor(private readonly sentryService: SentryService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, query, params } = request;

    // Create a new scope for this request
    const scope = new Sentry.Scope();
    scope.setContext('http', {
      method,
      url,
      query_string: query,
      body,
      params,
    });

    return next.handle().pipe(
      tap({
        next: (data) => {
          // Add response data to the scope
          scope.setExtra('response', data);
          scope.setLevel('info');
        },
        error: (error) => {
          // Add error information to the scope
          scope.setExtra('error', {
            message: error.message,
            stack: error.stack,
          });
          scope.setLevel('error');

          // Capture the error with Sentry
          this.sentryService.captureException(error, {
            extra: {
              method,
              url,
              query,
              body,
              params,
            },
          });
        },
      }),
    );
  }
}
