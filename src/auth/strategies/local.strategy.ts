import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    // Specify the fields to be validated. Defaults to 'username'.
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string): Promise<any> {
    const user = await this.authService.verifyUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Incorrect email or password');
    }

    // Make sure the organization ID is included in the user object
    return {
      ...user,
      organizationId: user.organizationId,
    };
  }
}
