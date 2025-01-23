import { Global, Module, OnModuleInit } from '@nestjs/common';
import { EmailSettingsModule } from '@/email-settings/email-settings.module';
import { AwsSqsService } from '@/utilities/aws-sqs-service/aws-sqs.service';
import { EmailStrategy } from './strategies/email/email.strategy';
import { WebPushNotificationStrategy } from './strategies/webPushNotification/webPushNotification.strategy';
import { NotificationConsumerService } from './notification-consumer.service';
import { NotificationService } from './notification.service';
import { PushNotificationTokenRepository } from '@/repository/push-notification-token.repository';
import { FirebaseService } from '@/utilities/firebase-admin-service/firebase-admin.service';
import { NotificationRepository } from '@/repository/notification.repository';

/**
 * defined notification module as global
 * module to use in all other modules.
 */
@Global()
@Module({
  imports: [EmailSettingsModule],
  providers: [
    AwsSqsService,
    NotificationService,
    NotificationConsumerService,
    EmailStrategy,
    WebPushNotificationStrategy,
    PushNotificationTokenRepository,
    NotificationRepository,
    FirebaseService,
  ],
  exports: [NotificationService, PushNotificationTokenRepository],
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
