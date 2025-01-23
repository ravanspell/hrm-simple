import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { Request } from 'express';
import { RequestWithTenant } from 'src/coretypes';
import { PushNotificationTokenRepository } from '@/repository/push-notification-token.repository';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly pushnotificationTokenRepository: PushNotificationTokenRepository,
  ) {}

  @Post('login')
  @UseGuards(LocalAuthGuard)
  async login(@Body() body: any, @Req() req: RequestWithTenant) {
    const user = req.user;
    const notificationToken = body?.notificationToken;
    console.log("notificationToken----->", notificationToken);
    
    // TODO: to be moved to service
    if (notificationToken) {
      await this.pushnotificationTokenRepository.upsertToken(
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
