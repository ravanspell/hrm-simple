import { Controller, Post, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { CurrentUser } from 'src/decorators/currentUser.decorator';
import { Response } from 'express';

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
        @CurrentUser() user: any,
        @Res({ passthrough: true }) response: Response,
    ) {
        return this.authService.login(user, response);
    }
}
