import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { Request } from 'express';
import { RequestWithTenant } from 'src/coretypes';
import { PushNotificationTokenRepository } from '@/repository/push-notification-token.repository';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserService } from '@/user/user.service';
import { Authentication } from '@/decorators/auth.decorator';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(
    private readonly pushNotificationTokenRepository: PushNotificationTokenRepository,
    private readonly userService: UserService,
  ) {}

  @Post('login')
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, description: 'User logged in successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async login(@Body() body: LoginDto, @Req() req: RequestWithTenant) {
    const user = req.user;
    const notificationToken = body?.notificationToken;
    // TODO: to be moved to service
    if (notificationToken) {
      await this.pushNotificationTokenRepository.upsertToken(
        user.id,
        notificationToken,
      );
    }
    return true;
  }

  @Get('logout')
  @ApiOperation({ summary: 'User logout' })
  @ApiResponse({ status: 200, description: 'User logged out successfully' })
  async logout(@Req() req: Request) {
    req.session.destroy(() => {});
    return true;
  }

  @Get('info')
  @Authentication()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get user info and permissions' })
  @ApiResponse({ status: 200, description: 'User info retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserInfo(@Req() req: RequestWithTenant) {
    const userId = req.user?.id;
    const userWithScopes = await this.userService.findUserWithScopes(userId);

    return {
      user: {
        email: userWithScopes.email,
        firstName: userWithScopes.firstName,
        lastName: userWithScopes.lastName,
      },
      scopes: userWithScopes.scopes,
    };
  }
}
