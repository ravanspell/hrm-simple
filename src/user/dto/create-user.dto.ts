import { Prisma } from '@prisma/client';
import {
    IsString,
    IsNotEmpty,
    IsOptional,
    IsDateString,
    IsInt,
    IsEmail,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

type TUser = Omit<Prisma.UserCreateInput, 'employmentStatus' | 'organization' | 'employeeLevel' | 'createdBy' | 'updatedBy'>;


export class CreateUserDto implements TUser {
    @ApiProperty({ description: 'First name of the user.' })
    @IsString()
    @IsNotEmpty()
    firstName: string;

    @ApiProperty({ description: 'Last name of the user.' })
    @IsString()
    @IsNotEmpty()
    lastName: string;

    @ApiProperty({ description: 'Email address of the user.' })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({ description: 'Gender of the user.' })
    @IsNotEmpty()
    gender: TUser['gender'];

    @ApiProperty({ description: 'Employment status ID associated with the user.' })
    @IsInt()
    @IsNotEmpty()
    employmentStatusId: number;

    @ApiProperty({ description: 'Start date of employment in ISO 8601 format.' })
    @IsDateString()
    @IsNotEmpty()
    startDate: Date;

    @ApiPropertyOptional({ description: 'End date of employment in ISO 8601 format, if applicable.' })
    @IsOptional()
    @IsDateString()
    endDate?: Date;

    @ApiPropertyOptional({ description: 'ID of the user who created this record, if available.' })
    @IsOptional()
    @IsInt()
    createdBy?: number;

    @ApiPropertyOptional({ description: 'ID of the user who last updated this record, if available.' })
    @IsOptional()
    @IsInt()
    updatedBy?: number;

    @ApiPropertyOptional({ description: 'Employee level ID associated with the user.' })
    @IsOptional()
    @IsInt()
    employeeLevelId: number;

    @ApiProperty({ description: 'Date of birth of the user in ISO 8601 format.' })
    @IsNotEmpty()
    @IsDateString()
    dateOfBirth: string | Date;
}
