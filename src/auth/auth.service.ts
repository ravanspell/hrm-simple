import { Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { compare, hash, genSalt } from 'bcryptjs';
import { ro } from '@faker-js/faker/.';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}

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
}
