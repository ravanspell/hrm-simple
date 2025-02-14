import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class ForgetPasswordRequest {
    @ApiProperty({
        description: 'Reset token',
        example: 'some-random-token',
    })
    @IsNotEmpty({message: 'Email required'})
    @IsEmail()
    email: string;
}
