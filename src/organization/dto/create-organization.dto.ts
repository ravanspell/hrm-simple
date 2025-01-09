import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateOrganizationDto {
  @ApiProperty({
    example: 'My Organization',
    description: 'The name of the organization',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'This is a description of the organization',
    description: 'The description of the organization',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: 'logo.png',
    description: 'The logo of the organization',
    required: false,
  })
  @IsString()
  @IsOptional()
  logo?: string;
}
