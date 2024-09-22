import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { CurrentUser } from 'src/decorators/currentUser.decorator';
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
        @CurrentUser() user: User
    ) {
        return {
            user: {
                email: user.email,
                firstName: user.firstName,
                lestName: user.lastName
            }
        };
    }

    @Get('logout')
    async logout(@Req() req) {
        req.session.destroy();
        return true;
    }
}
