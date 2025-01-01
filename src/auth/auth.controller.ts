import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { Request } from 'express';
import { RequestWithTenant } from 'src/coretypes';

@Controller('auth')
export class AuthController {
  @Post('login')
  @UseGuards(LocalAuthGuard)
  async login(@Req() req: RequestWithTenant) {
    const user = req.user;
    return {
      user: {
        email: user.email,
        firstName: user.firstName,
        lestName: user.lastName,
      },
    };
  }

  @Get('logout')
  async logout(@Req() req: Request) {
    req.session.destroy(() => {});
    return true;
  }
}
