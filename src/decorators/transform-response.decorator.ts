import { SetMetadata } from '@nestjs/common';

export const TRANSFORM_RESPONSE_KEY = 'transform_response_dto';
/**
 * Decorator to transform the response of a controller method
 *
 * @param dto - The DTO to transform the response to
 * @example
 * @Controller('users')
 * export class UsersController {
 *   @Get()
 *   @TransformResponse(UserResponseDto)
 *   async findAll(): Promise<UserResponseDto[]> {
 *     return this.usersService.findAll();
 *   }
 * }
 */
export const TransformResponse = (dto: any) =>
  SetMetadata(TRANSFORM_RESPONSE_KEY, dto);
