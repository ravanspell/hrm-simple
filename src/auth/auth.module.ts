import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from 'src/user/user.module';
import { LocalStrategy } from './strategies/local.strategy';
import { PassportModule } from '@nestjs/passport';
import { SessionSerializer } from './session.serializer';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Session } from './entities/session.entity';
import { NotificationTokenRepository } from '@/repository/notification-token.repository';

@Module({
  imports: [
    UserModule,
    PassportModule.register({ session: true }),
    TypeOrmModule.forFeature([Session]),
  ],
  exports: [],
  providers: [AuthService, LocalStrategy, SessionSerializer, NotificationTokenRepository],
  controllers: [AuthController],
})
export class AuthModule {}
