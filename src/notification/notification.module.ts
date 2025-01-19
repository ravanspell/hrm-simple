import { Module, OnModuleInit } from '@nestjs/common';
import { EmailSettingsModule } from '@/email-settings/email-settings.module';
import { AwsSqsService } from '@/utilities/aws-sqs-service/aws-sqs.service';
import { EmailStrategy } from './strategies/email/email.strategy';
import { WebPushNotificationStrategy } from './strategies/webPushNotification/webPushNotification.strategy';
import { NotificationConsumerService } from './notification-consumer.service';
import { NotificationPublisherService } from './notification-publisher.service';
import { NotificationTokenRepository } from '@/repository/notification-token.repository';
import { FirebaseService } from '@/utilities/firebase-admin-service/firebase-admin.service';

@Module({
  imports: [EmailSettingsModule],
  providers: [
    AwsSqsService,
    NotificationPublisherService,
    NotificationConsumerService,
    EmailStrategy,
    WebPushNotificationStrategy,
    NotificationTokenRepository,
    FirebaseService
  ],
  exports: [NotificationPublisherService, NotificationTokenRepository],
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
