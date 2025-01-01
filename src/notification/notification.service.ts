import { Injectable } from '@nestjs/common';
import { AwsSqsService } from '../utilities/aws-sqs-service/aws-sqs.service';
import { ConfigService } from '@nestjs/config';
import { Message } from '@aws-sdk/client-sqs';

@Injectable()
export class NotificationService {
  private readonly notificationQueueUrl: string;
  private readonly notificationQueuePollingDelay = 20;
  private readonly notificationMessagesBatchSize = 5;

  private queuePolling = true;

  constructor(
    private readonly awsSqsService: AwsSqsService,
    private readonly configService: ConfigService,
  ) {
    this.notificationQueueUrl = this.configService.get<string>('NOTIFICATION_QUEUE_URL');
  }

  async onModuleInit() {
    this.pollNotificationsQueue();
  }

  async onModuleDestroy() {
    this.queuePolling = false;
  }

  private async pollNotificationsQueue() {
    const poll = async () => {
      while (this.queuePolling) {
        try {
          const messages = await this.awsSqsService.receiveMessages(
            this.notificationQueueUrl,
            this.notificationMessagesBatchSize,
            this.notificationQueuePollingDelay,
          );
          console.log("messages-->", messages);
          if (messages.length > 0) {
            await this.sendNotifications(messages);
          }
        } catch (error) {
          console.error('Error during polling:', error);
        }
      }
    };
    setImmediate(poll); // Start the initial poll immediately without delay
  };

  private async sendNotifications(messages: Message[]) {
    await this.delay(20000);
    console.log("message has been sent");
    const deleteQueue = messages.map((message) => this.awsSqsService.deleteMessage(
      this.notificationQueueUrl,
      message.ReceiptHandle
    ));
    await Promise.all(deleteQueue);
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
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
  public async publishNotification(type: string, payload: Record<string, any>): Promise<void> {
    const messageBody = JSON.stringify({ type, payload });

    await this.awsSqsService.publishMessage(
      this.notificationQueueUrl,
      messageBody,
      { Type: type } // Add attributes for filtering or categorization
    );

    console.log(`Notification of type "${type}" published to the queue.`);
  }
}
