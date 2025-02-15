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
import {
  ApiBadRequestResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserService } from '@/user/user.service';
import { Authentication } from '@/decorators/auth.decorator';
import { LoginDto } from './dto/login.dto';
import { ForgetPasswordRequest } from './dto/forget-password.dto';
import { AuthService } from './auth.service';
import { SubmitForgotPasswordRequest } from './dto/forgot-password-submit.dto';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(
    private readonly pushNotificationTokenRepository: PushNotificationTokenRepository,
    private readonly userService: UserService,
    private readonly authService: AuthService,
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
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User logged in successfully',
  })
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
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User info retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'User not found',
  })
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

  /**
   * Initiate the forgot password process.
   *
   * This endpoint accepts an email address and, if an account exists, creates a reset token
   * stored on the user record. In a production environment, the raw token should be emailed
   * to the user.
   * 
   * @param dto - Contains the user's email.
   * @returns A message indicating that a reset link has been sent.
   */
  @Post('forget-password')
  @ApiOperation({ summary: 'Request a password reset link.' })
  @ApiResponse({
    status: HttpStatus.OK,
    description:
      'If an account with that email exists, a reset link has been sent.',
    schema: {
      example: {
        message:
          'If an account with that email exists, a reset link has been sent. Reset ID: 123, token: some-random-token',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid email address format.',
  })
  async requestForgetPassword(
    @Body() dto: ForgetPasswordRequest,
  ): Promise<{ message: string }> {
    // TODO: need to setup the email service instead of return the tokens
    // TODO: the link to be https://theapp.com/reset-password?rid=resetRequestId&token=raw-token
    const { id, token } = await this.authService.initiateForgetPassword(dto.email);
    return {
      message: `If an account with that email exists, a reset link has been sent. Reset ID: ${id}, token: ${token}`,
    };
  }

  /**
   * Submit a new password using the forgot password reset link.
   *
   * This endpoint accepts the reset request ID and token (both provided in the reset link),
   * along with the new password and its confirmation. It verifies the token and, if valid,
   * updates the user's password.
   *
   * @param dto - Contains the resetRequestId, token, new password, and password confirmation.
   * @returns A success message upon a successful password reset.
   *
   */
  @Post('forgot-password/submit')
  @ApiOperation({ summary: 'Submit new password for forgot password flow.' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Password has been reset successfully.',
    schema: {
      example: { message: 'Password has been reset successfully.' },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid or expired token, or password validation error.',
  })
  async submitForgotPassword(
    @Body() dto: SubmitForgotPasswordRequest,
  ): Promise<{ message: string }> {
    await this.authService.submitForgotPassword(
      dto.resetRequestId,
      dto.token,
      dto.password,
    );
    return { message: 'Password has been reset successfully.' };
  }
}
