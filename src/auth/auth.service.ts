import { BadRequestException, Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { compare, hash, genSalt } from 'bcryptjs';
import * as uuid from 'uuid';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) { }

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
  async initiateForgetPassword(
    email: string,
  ): Promise<{ id: string; token: string }> {
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

    // TODO: implement the email template with email service for forgot password
    return { id: user.id, token };
  }
}
