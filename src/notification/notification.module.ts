import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationFactory } from './notification.factory';
import { EmailModule } from './strategies/email/email.module';
import { EmailSettingsModule } from 'src/email-settings/email-settings.module';

@Module({
  imports: [EmailModule, EmailSettingsModule],
  providers: [NotificationService, NotificationFactory],
  exports: [NotificationService],
})
export class NotificationModule {}
