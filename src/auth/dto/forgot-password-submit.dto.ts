import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import Match from '@/validators/match.validator';

export class SubmitForgotPasswordRequest {
    @ApiProperty({
        description: 'Unique identifier for the reset request',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @IsString()
    @IsNotEmpty()
    resetRequestId: string;

    @ApiProperty({
        description: 'Reset token provided in the reset link',
        example: 'raw-reset-token',
    })
    @IsString()
    @IsNotEmpty()
    token: string;

    @ApiProperty({
        description: 'New password to set',
        example: 'NewPa$$w0rd!',
    })
    @IsString()
    @MinLength(8)
    password: string;

    @ApiProperty({
        description: 'Confirmation of the new password',
        example: 'NewPa$$w0rd!',
    })
    @IsString()
    @IsNotEmpty()
    @Match('password', { message: 'Passwords do not match' })
    confirmPassword: string;
}