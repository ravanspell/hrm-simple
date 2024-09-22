import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from 'src/user/user.module';
import { LocalStrategy } from './strategies/local.strategy';
import { PassportModule } from '@nestjs/passport';
// import { JwtModule } from '@nestjs/jwt';
import { SessionSerializer } from './session.serializer';

@Module({
  imports: [
    UserModule,
    PassportModule.register({ session: true }),
    // JwtModule.register({
    //   secret: process.env.JWT_ACCESS_TOKEN_SECRET,
    //   signOptions: {
    //     expiresIn: new Date().setMilliseconds(
    //       new Date().getTime() + parseInt(process.env.JWT_ACCESS_TOKEN_EXPIRATION_MS)
    //     ),
    //   },
    // }),
  ],
  providers: [AuthService, LocalStrategy, SessionSerializer],
  controllers: [AuthController]
})
export class AuthModule { }
