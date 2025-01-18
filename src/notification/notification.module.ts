import { Module, OnModuleInit } from '@nestjs/common';
import { EmailSettingsModule } from 'src/email-settings/email-settings.module';
import { AwsSqsService } from '../utilities/aws-sqs-service/aws-sqs.service';
import { EmailStrategy } from './strategies/email/email.strategy';
import { WebPushNotificationStrategy } from './strategies/webPushNotification/webPushNotification.strategy';
import { NotificationConsumerService } from './notification-consumer.service';
import { NotificationPublisherService } from './notification-publisher.service';
import { SessionService } from '@/auth/session.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Session } from '@/auth/entities/session.entity';

@Module({
  imports: [EmailSettingsModule, TypeOrmModule.forFeature([Session])],
  providers: [
    AwsSqsService,
    NotificationPublisherService,
    NotificationConsumerService,
    EmailStrategy,
    WebPushNotificationStrategy,
    SessionService,
  ],
  exports: [NotificationPublisherService],
})
export class NotificationModule implements OnModuleInit {
  constructor(
    private readonly notificationConsumerService: NotificationConsumerService,
    private readonly emailStrategy: EmailStrategy,
    private readonly webPushStrategy: WebPushNotificationStrategy,
  ) {}

  onModuleInit() {
    this.notificationConsumerService.registerStrategy(this.emailStrategy);
    this.notificationConsumerService.registerStrategy(this.webPushStrategy);
  }
}
