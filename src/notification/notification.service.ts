import { Injectable } from '@nestjs/common';
import { AwsSqsService } from './aws-sqs.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class NotificationService {
  private readonly notificationQueueUrl: string;

  constructor(
    private readonly awsSqsService: AwsSqsService,
    private readonly configService: ConfigService,
  ) {
    this.notificationQueueUrl = this.configService.get<string>('NOTIFICATION_QUEUE_URL');
  }

  /**
   * Publish a notification message.
   * 
   * This wrapper method centralizes the logic for publishing messages to the SQS queue.
   * It ensures that other modules don't need direct access to AwsSqsService, providing better encapsulation.
   * 
   * @param type - The type of notification (e.g., 'email', 'notification', etc.).
   * @param payload - The message content to be sent.
   * 
   * @example
   * await notificationsService.publishNotification('email', { subject: 'Hello', body: 'World' });
   */
  async publishNotification(type: string, payload: Record<string, any>): Promise<void> {
    const messageBody = JSON.stringify({ type, payload });

    await this.awsSqsService.publishMessage(
      this.notificationQueueUrl,
      messageBody,
      { Type: type } // Add attributes for filtering or categorization
    );

    console.log(`Notification of type "${type}" published to the queue.`);
  }
}
