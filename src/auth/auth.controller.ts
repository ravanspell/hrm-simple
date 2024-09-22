import { Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { CurrentUser } from 'src/decorators/currentUser.decorator';
import { Response } from 'express';
import { User } from '@prisma/client';

@Controller('auth')
export class AuthController {

    constructor(private readonly authService: AuthService) { }

    // @Post('signup')
    // async signup() {
    //     return this.authService.login();
    // }

    @Post('login')
    @UseGuards(LocalAuthGuard)
    async login(
        @CurrentUser() user : User,
        @Res({ passthrough: true }) res: Response,
    ) {
        return user;
    }
}
