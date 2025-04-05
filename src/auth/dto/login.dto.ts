import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class LoginDto {
  /**
   * The email address of the user.
   *
   * @example "user@example.com"
   */
  @ApiProperty({
    description: 'The email address of the user.',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: 'The email must be a valid email address.' })
  email: string;

  /**
   * The password of the user.
   *
   * This is the password the user uses to authenticate.
   * @example "P@sswrd!"
   */
  @ApiProperty({
    description: 'The password of the user.',
    example: 'P@ssw0rd!',
  })
  @IsString({ message: 'The password must be a string.' })
  password: string;

  /**
   * An optional notification token for push notifications.
   *
   * This token can be used to register the user's device for notifications.
   * @example "fcm_token_12345"
   */
  @ApiPropertyOptional({
    description: 'An optional notification token for push notifications.',
    example: 'fcm_token_12345',
  })
  @IsOptional()
  @IsString({ message: 'The notification token must be a string.' })
  notificationToken?: string;

  /**
   * The turnstile token for the user.
   *
   * This token is used to verify the user's turnstile token.
   */
  @ApiProperty({
    description: 'The turnstile token for the user.',
    example: 'turnstile_token_12345',
  })
  @IsString()
  @IsOptional()
  @IsString({ message: 'The turnstile token must be a string.' })
  turnstileToken: string;
}
