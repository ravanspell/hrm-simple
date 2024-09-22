import { Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { compare } from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
// import { Prisma } from '@prisma/client';
// import { Response } from 'express';

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
        // private readonly jwtService: JwtService
    ) { }

    // async login(user: Prisma.UserCreateInput, response: Response) {
    //     const jwtExpireTime = new Date();
    //     jwtExpireTime.setMilliseconds(
    //         jwtExpireTime.getTime() + parseInt(process.env.JWT_ACCESS_TOKEN_EXPIRATION_MS)
    //     );

    //     const jwtPayload = {
    //         userId: user.email,
    //     };
    //     const jwtToken = this.jwtService.sign(jwtPayload);
    //     console.log("user jwt", jwtToken);
    //     response.cookie('accessToken', jwtToken, {
    //         httpOnly: true,
    //         secure: false,
    //         expires: jwtExpireTime,
    //     })
        
    // }

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
