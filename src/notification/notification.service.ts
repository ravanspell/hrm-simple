import { Injectable } from '@nestjs/common';
import { AwsSqsService } from '../utilities/aws-sqs-service/aws-sqs.service';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { NotificationRepository } from '@/repository/notification.repository';
import { Notification } from './entities/notification.entity';

type NotificationTypePayloads = {
  email: {
    userId: string;
    subject?: string;
    body?: string;
    templateId?: string;
  };
  webPush: {
    userId: string;
    subject: string;
    body: string;
  };
};

@Injectable()
export class NotificationService {
  private readonly notificationQueueUrl: string;

  constructor(
    private readonly awsSqsService: AwsSqsService,
    private readonly configService: ConfigService,
    private readonly notificationRepository: NotificationRepository,
  ) {
    this.notificationQueueUrl = this.configService.get<string>(
      'NOTIFICATION_QUEUE_URL',
    );
  }

  /**
   * Publishes a notification message to the SQS queue.
   *
   * This wrapper method centralizes the logic for publishing messages to the SQS queue.
   * It ensures that other modules don't need direct access to AwsSqsService, providing better encapsulation.
   *
   * @param type - The type of notification (e.g., 'email', 'webPush').
   * @param payload - The message content to be sent.
   *
   * @example
   * await notificationsService.publishNotification('email', { subject: 'Hello', body: 'World' });
   */
  async publishNotification<T extends keyof NotificationTypePayloads>(
    type: T,
    payload: NotificationTypePayloads[T],
  ): Promise<void> {
    const messageBody = JSON.stringify({ type, payload });

    await this.awsSqsService.publishMessage(
      this.notificationQueueUrl,
      messageBody,
      { Type: type, id: uuidv4() },
    );
    console.log(`Notification of type "${type}" published to the queue.`);
  }

  /**
   * Retrieves all notifications for a specific user.
   * @param userId - The user ID.
   * @returns Array of notifications.
   */
  async getUserNotifications(userId: string): Promise<Notification[]> {
    return this.notificationRepository.getNotificationsByUser(userId);
  }

  /**
   * Marks a notification as read.
   * @param notificationId - The notification ID.
   */
  async markNotificationAsRead(notificationId: string): Promise<void> {
    await this.notificationRepository.markAsRead(notificationId);
  }
}
