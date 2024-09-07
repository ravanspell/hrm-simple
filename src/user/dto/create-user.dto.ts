import { Prisma } from '@prisma/client';
import {
    IsString,
    IsNotEmpty,
    IsOptional,
    IsDateString,
    IsInt,
    IsEmail,
} from 'class-validator';

type TUser = Prisma.UserCreateInput;
export class CreateUserDto implements Omit<TUser, 'organization'>{
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
    employmentStatus: number;

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
    employeeLevel: number;
}
