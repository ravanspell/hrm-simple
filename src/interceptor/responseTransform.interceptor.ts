/**
 * Generic response transformer interceptor
 * tranform the response
 * log the response
 */
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface Response<T> {
  data: T;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => {
        const ctx = context.switchToHttp();
        const response = ctx.getResponse();
        // const request = ctx.getRequest();

        const statusCode = response.statusCode;
        // const url = request.originalUrl;
        const res = {
          statusCode,
          msg: null,
          success: true,
          data,
        };
        return res;
      }),
    );
  }
}
