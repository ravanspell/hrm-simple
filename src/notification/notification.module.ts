import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NotificationService } from './notification.service';
import { NotificationFactory } from './notification.factory';
import { EmailModule } from './strategies/email/email.module';

@Module({
  imports: [ConfigModule, EmailModule],
  providers: [NotificationService, NotificationFactory],
  exports: [NotificationService],
})
export class NotificationModule {}
