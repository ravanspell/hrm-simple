import { Prisma } from '@prisma/client';
import {
    IsString,
    IsNotEmpty,
    IsOptional,
    IsDateString,
    IsInt,
    IsEmail,
} from 'class-validator';

export class CreateUserDto implements Prisma.UsersCreateInput {
    @IsString()
    @IsNotEmpty()
    firstName: string;

    @IsString()
    @IsNotEmpty()
    lastName: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsNotEmpty()
    gender: Prisma.UsersCreateInput['gender']

    @IsInt()
    @IsNotEmpty()
    employmentStatusId: number;

    @IsDateString()
    @IsNotEmpty()
    startDate: Date;

    @IsOptional()
    @IsDateString()
    endDate?: Date;

    @IsOptional()
    @IsInt()
    createdBy?: number;

    @IsOptional()
    @IsInt()
    updatedBy?: number;

    @IsOptional()
    @IsInt()
    employeeLevelId?: number;
}
