import { Prisma } from '@prisma/client';
import {
    IsString,
    IsNotEmpty,
    IsOptional,
    IsDateString,
    IsInt,
    IsEmail,
} from 'class-validator';

type TUser = Omit<Prisma.UserCreateInput, 'employmentStatus' | 'organization' | 'employeeLevel' | 'createdBy' | 'updatedBy'>;
export class CreateUserDto implements TUser {
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
    gender: TUser['gender']

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
    employeeLevelId: number;

    @IsNotEmpty()
    @IsDateString()
    dateOfBirth: string | Date;
}
