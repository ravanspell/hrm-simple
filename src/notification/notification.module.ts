import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationFactory } from './notification.factory';
import { EmailSettingsModule } from 'src/email-settings/email-settings.module';
import { AwsSqsService } from '../utilities/aws-sqs-service/aws-sqs.service';

@Module({
  imports: [EmailSettingsModule],
  providers: [
    AwsSqsService,
    NotificationService, 
    NotificationFactory,
  ],
  exports: [NotificationService],
})
export class NotificationModule {}
