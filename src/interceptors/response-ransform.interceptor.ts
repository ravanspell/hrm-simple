/**
 * Generic response transformer interceptor
 * Transforms the response globally and applies optional DTO transformation
 */
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { plainToInstance } from 'class-transformer';
import { TRANSFORM_RESPONSE_KEY } from '../decorators/transform-response.decorator';

interface Response<T> {
  data: T;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  constructor(private readonly reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<Response<T>> {
    const handler = context.getHandler();
    const dto = this.reflector.get(TRANSFORM_RESPONSE_KEY, handler);

    return next.handle().pipe(
      map((data) => {
        const ctx = context.switchToHttp();
        const response = ctx.getResponse();
        const statusCode = response.statusCode;

        // Optional: apply class-transformer if @TransformResponse is present with a dto
        let transformedData = data;
        if (dto) {
          transformedData = plainToInstance(dto, data, {
            excludeExtraneousValues: true,
          });
        }

        return {
          statusCode,
          msg: null,
          success: true,
          data: transformedData,
        };
      }),
    );
  }
}
