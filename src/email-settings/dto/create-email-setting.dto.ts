import { IsString, IsInt, IsBoolean, IsEmail, IsOptional } from 'class-validator';

export class CreateEmailSettingsDto {
  @IsString()
  emailHost: string;

  @IsInt()
  emailPort: number;

  @IsString()
  displayName: string;

  @IsEmail()
  defaultFromEmail: string;

  @IsString()
  emailHostUsername: string;

  @IsString()
  emailAuthPassword: string;

  @IsBoolean()
  @IsOptional()
  useTLS?: boolean;

  @IsBoolean()
  @IsOptional()
  useSSL?: boolean;

  @IsBoolean()
  @IsOptional()
  isPrimary?: boolean;

  @IsInt()
  @IsOptional()
  emailSendTimeout?: number;

  @IsString()
  organizationId: string;
}
