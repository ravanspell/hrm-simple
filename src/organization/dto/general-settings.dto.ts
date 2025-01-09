import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, Min, Max, IsOptional, Length } from 'class-validator';

/**
 * DTO for General Settings, used for both creation and updates.
 * All properties are optional to allow partial updates.
 */
export class GeneralSettingsDto {
  @ApiProperty({
    description: 'Number of days announcements expire by default.',
    example: 30,
    required: false,
  })
  @IsOptional()
  @IsInt({ message: 'announcementExpireDays must be an integer.' })
  @Min(1, { message: 'announcementExpireDays must be at least 1.' })
  @Max(365, { message: 'announcementExpireDays cannot exceed 365.' })
  announcementExpireDays?: number;

  @ApiProperty({
    description: 'Default number of records per page for pagination.',
    example: 10,
    required: false,
  })
  @IsOptional()
  @IsInt({ message: 'recordsPerPage must be an integer.' })
  @Min(1, { message: 'recordsPerPage must be at least 1.' })
  @Max(100, { message: 'recordsPerPage cannot exceed 100.' })
  recordsPerPage?: number;

  @ApiProperty({
    description: 'Default notice period in days.',
    example: 60,
    required: false,
  })
  @IsOptional()
  @IsInt({ message: 'noticePeriodDays must be an integer.' })
  @Min(1, { message: 'noticePeriodDays must be at least 1.' })
  @Max(365, { message: 'noticePeriodDays cannot exceed 365.' })
  noticePeriodDays?: number;

  @ApiProperty({
    description: 'Default currency for financial transactions.',
    example: 'USD',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'currency must be a string.' })
  @Length(3, 3, { message: 'currency must be exactly 3 characters.' })
  currency?: string;
}
