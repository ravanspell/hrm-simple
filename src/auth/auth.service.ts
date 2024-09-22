import { Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { compare } from 'bcryptjs';

@Injectable()
export class AuthService {
    constructor(private readonly userService: UserService) { }

    async verifyUser(email: string, password: string) {
        const user = await this.userService.findOne(email);
        if (!user) {
            return null;
        }
        const authenticated = await await compare(password, user.password);
        if (!authenticated) {
            return null;
        }
        return user;
    }
}
