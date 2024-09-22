import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { CurrentUser } from 'src/decorators/currentUser.decorator';
import { User } from '@prisma/client';
import { Request } from 'express';

@Controller('auth')
export class AuthController {

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
    async logout(@Req() req: Request) {
        req.session.destroy(() => { });
        return true;
    }
}
