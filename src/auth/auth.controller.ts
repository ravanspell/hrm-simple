import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { Request } from 'express';
import { RequestWithTenant } from 'src/coretypes';
import { NotificationTokenRepository } from '@/repository/notification-token.repository';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly notificationTokenRepository: NotificationTokenRepository,
  ) {}

  @Post('login')
  @UseGuards(LocalAuthGuard)
  async login(@Body() body: any, @Req() req: RequestWithTenant) {
    const user = req.user;
    const notificationToken = body?.notificationToken;
    // TODO: to be moved to service
    if (notificationToken) {
      await this.notificationTokenRepository.upsertToken(
        user.id,
        notificationToken,
      );
    }
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
