// src/users/dto/filter-users.dto.ts
import { IsOptional, IsString } from 'class-validator';

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

export class FilterUsersDto {
  @IsOptional()
  @IsString()
  field: string;

  @IsOptional()
  @IsString()
  operator: string;

  @IsOptional()
  value: string | string[] | Gender | number;

  @IsOptional()
  @IsString()
  logic: 'AND' | 'OR';
}
