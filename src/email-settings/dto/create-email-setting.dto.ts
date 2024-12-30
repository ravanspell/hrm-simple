import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsInt,
  IsBoolean,
  IsEmail,
  IsOptional,
} from 'class-validator';

export class CreateEmailSettingsDto {
  @ApiProperty({ description: 'Email server host name or IP address' })
  @IsString()
  emailHost: string;

  @ApiProperty({
    description: 'Port number used by the email server',
    example: 587,
  })
  @IsInt()
  emailPort: number;

  @ApiProperty({ description: 'Display name for outgoing emails' })
  @IsString()
  displayName: string;

  @ApiProperty({
    description: 'Default "from" email address',
    example: 'noreply@example.com',
  })
  @IsEmail()
  defaultFromEmail: string;

  @ApiProperty({
    description: 'Username for authenticating with the email server',
  })
  @IsString()
  emailHostUsername: string;

  @ApiProperty({
    description: 'Password for authenticating with the email server',
  })
  @IsString()
  emailAuthPassword: string;

  @ApiPropertyOptional({
    description: 'Whether to use TLS for email transmission',
  })
  @IsBoolean()
  @IsOptional()
  useTLS?: boolean;

  @ApiPropertyOptional({
    description: 'Whether to use SSL for email transmission',
  })
  @IsBoolean()
  @IsOptional()
  useSSL?: boolean;

  @ApiPropertyOptional({
    description: 'Indicates if this is the primary email setting',
  })
  @IsBoolean()
  @IsOptional()
  isPrimary?: boolean;

  @ApiPropertyOptional({
    description: 'Timeout for sending emails, in milliseconds',
  })
  @IsInt()
  @IsOptional()
  emailSendTimeout?: number;

  @ApiPropertyOptional({ description: 'ID of the associated organization' })
  @IsString()
  @IsOptional()
  organizationId?: string;
}
