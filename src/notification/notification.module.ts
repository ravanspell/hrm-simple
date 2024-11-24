import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationFactory } from './notification.factory';
import { EmailModule } from './strategies/email/email.module';
import { EmailSettingsModule } from 'src/email-settings/email-settings.module';
import { AwsSqsService } from './aws-sqs.service';

@Module({
  imports: [EmailModule, EmailSettingsModule],
  providers: [
    AwsSqsService,
    NotificationService, 
    NotificationFactory,
  ],
  exports: [NotificationService],
})
export class NotificationModule {}
