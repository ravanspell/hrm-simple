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
  ) { }

  /**
   * Handles user login and generates an authenticated session.
   * 
   * This endpoint authenticates the user based on provided credentials and, if
   * successful, stores a session. Additionally, it can update the push notification
   * token for the user.
   *
   * @param body - The login credentials including optional notification token.
   * @param req - The Express request object containing session details.
   * @returns A boolean indicating successful login.
   *
   */
  @Post('login')
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: HttpStatus.OK, description: 'User logged in successfully' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
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
    req.session.destroy(() => { });
    return true;
  }

  /**
   * Logs the user out by destroying the session.
   *
   * This endpoint clears the user's session, effectively logging them out.
   *
   * @param req - The Express request object containing session data.
   * @returns A boolean indicating successful logout.
   *
   */
  @Get('info')
  @Authentication()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get user info and permissions' })
  @ApiResponse({ status: HttpStatus.OK, description: 'User info retrieved successfully' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'User not found' })
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
