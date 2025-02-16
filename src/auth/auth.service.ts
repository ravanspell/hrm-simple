import { BadRequestException, Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { compare, hash, genSalt } from 'bcryptjs';
import * as uuid from 'uuid';
import { NotificationService } from '@/notification/notification.service';
import { NOTIFICATION_TYPE } from '@/constants/notifications';
import { Transactional } from 'typeorm-transactional';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly notificationService: NotificationService,
  ) {}

  async verifyUser(email: string, password: string) {
    const user = await this.userService.findOne(email);
    // get user scope data for permission checking
    const userScopes = await this.userService.findUserWithScopes(user.id);

    if (!user) {
      return null;
    }
    // const salt = await genSalt(10);
    // const hashd = await hash(password, salt);
    // console.log('Hashed password:', hashd);
    const authenticated = await await compare(password, user.password);
    if (!authenticated) {
      return null;
    }
    return {
      ...user,
      scopes: userScopes?.scopes || [],
      roles: userScopes?.roles || [],
    };
  }

  /**
   * Initiates the forget password flow by generating a reset token.
   *
   * @param email - The email address associated with the user account.
   * @returns An object containing the reset entry id and the raw token.
   *
   */
  @Transactional()
  async initiateForgetPassword(email: string): Promise<boolean> {
    const user = await this.userService.findOne(email);
    if (!user) {
      // Do not reveal user existence. Always respond with the same message.
      throw new BadRequestException(
        'If the email exists, a reset link will be sent.',
      );
    }
    // Generate a secure random token and remove any slashes for URL safety.
    const token = (await genSalt(10)).replace(/\//g, '');
    const tokenHash = await hash(token, 10);
    // Set expiration time to 3 hours from now.
    const expiresAt = new Date(Date.now() + 3 * 60 * 60 * 1000);

    // Generate a unique reset request ID
    const resetRequestId = uuid.v4();

    // Update the user entity with the reset token and expiry.
    user.resetPasswordToken = tokenHash;
    user.resetPasswordExpires = expiresAt;
    user.resetRequestId = resetRequestId;
    // Persist the changes.
    await this.userService.save(user);

    // sends the password reset link into the user's email
    // TODO: setup email template service to keep email templates.
    await this.notificationService.publishNotification(
      NOTIFICATION_TYPE.EMAIL,
      {
        userId: user.id,
        subject: 'Password Reset',
        body: `Hi, follow this link to reset your password https://theapp.com/reset-password?rid=${resetRequestId}&token=${token}`,
      },
    );
    return true;
  }

  /**
   * Submits a new password for the forgot password flow.
   *
   * @param resetRequestId - Unique reset request identifier provided in the reset link.
   * @param token - The raw reset token provided in the reset link.
   * @param newPassword - The new password to set for the user.
   *
   */
  async submitForgotPassword(
    resetRequestId: string,
    token: string,
    newPassword: string,
  ): Promise<void> {
    // Retrieve the user by the resetRequestId.
    const user = await this.userService.findResetPasswordUser(resetRequestId);

    // Verify that the token has not expired.
    if (new Date() > user.resetPasswordExpires) {
      throw new BadRequestException('Token has expired.');
    }
    // Validate the provided token.
    const isValid = await compare(token, user.resetPasswordToken);

    if (!isValid) {
      throw new BadRequestException('Invalid token.');
    }
    // Hash the new password.
    const hashedPassword = await hash(newPassword, 10);
    user.password = hashedPassword;
    // Clear reset token fields.
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    user.resetRequestId = null;

    await this.userService.save(user);
  }
}
