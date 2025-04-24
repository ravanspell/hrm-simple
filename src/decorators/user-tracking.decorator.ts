import { SetMetadata } from '@nestjs/common';

export const USER_TRACKING_KEY = 'userTracking';

/**
 * This decorator marks routes that should track user for created/updated fields
 *
 * @example
 * @Post()
 * @TrackUser()
 * async create(@Body() createUserDto: CreateUserDto) {
 *   return this.userService.create(createUserDto);
 * }
 */
export const TrackUser = () => SetMetadata(USER_TRACKING_KEY, true);
