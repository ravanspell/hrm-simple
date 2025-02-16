import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { AwsSqsService } from '@/utilities/aws-sqs-service/aws-sqs.service';
import { ConfigService } from '@nestjs/config';
import { Message } from '@aws-sdk/client-sqs';
import { NotificationStrategy } from './notification.strategy.interface';

@Injectable()
export class NotificationConsumerService
  implements OnModuleInit, OnModuleDestroy
{
  private readonly notificationQueueUrl: string;
  private readonly notificationQueuePollingDelay = 20;
  private readonly notificationMessagesBatchSize = 5;

  private queuePolling = true;
  private strategies: Map<string, NotificationStrategy> = new Map();

  constructor(
    private readonly awsSqsService: AwsSqsService,
    private readonly configService: ConfigService,
  ) {
    this.notificationQueueUrl = this.configService.get<string>(
      'NOTIFICATION_QUEUE_URL',
    );
  }

  /**
   * Initializes the notification polling process when the module starts.
   */
  async onModuleInit(): Promise<void> {
    this.pollNotificationsQueue();
  }

  /**
   * Stops the notification polling process when the module is destroyed.
   */
  async onModuleDestroy(): Promise<void> {
    this.queuePolling = false;
  }

  /**
   * Registers a notification strategy for handling specific types of notifications.
   *
   * @param strategy - The notification strategy to register.
   */
  registerStrategy(strategy: NotificationStrategy): void {
    this.strategies.set(strategy.type, strategy);
  }

  /**
   * Retrieves a registered notification strategy by its type.
   *
   * @param type - The type of notification strategy to retrieve.
   * @returns The notification strategy or undefined if not found.
   */
  getStrategy(type: string): NotificationStrategy | undefined {
    return this.strategies.get(type);
  }

  /**
   * Continuously polls the SQS queue for messages.
   *
   * Processes each message using the corresponding notification strategy.
   */
  private async pollNotificationsQueue(): Promise<void> {
    const poll = async () => {
      while (this.queuePolling) {
        try {
          const messages = await this.awsSqsService.receiveMessages(
            this.notificationQueueUrl,
            this.notificationMessagesBatchSize,
            this.notificationQueuePollingDelay,
          );
          console.log('messages-->', messages);
          if (messages.length > 0) {
            console.log(`Received ${messages.length} messages`);

            const results = await Promise.allSettled(
              messages.map((message) => this.sendNotifications(message)),
            );

            results.forEach((result, index) => {
              if (result.status === 'fulfilled') {
                console.log(`Message ${index + 1} processed successfully`);
              } else {
                console.error(`Message ${index + 1} failed:`, result.reason);
              }
            });
          }
        } catch (error) {
          console.error('Error during polling:', error);
        }
      }
    };
    setImmediate(poll);
  }

  /**
   * Processes a single notification message using the appropriate strategy.
   *
   * @param message - The message to process.
   */
  private async sendNotifications(message: Message): Promise<void> {
    // Step 1: parse the queue message into Js object
    const notificationPayload = JSON.parse(message?.Body);

    const notificationStrategyType = notificationPayload.type;
    // Step 2: get the notification strategy
    const notificationStrategy = this.getStrategy(notificationStrategyType);
    if (!notificationStrategy) {
      throw new Error(`Strategy not found: ${notificationStrategyType}`);
    }
    const currentNotificationPayload = notificationPayload.payload;
    // send the email and delete the queue message
    await notificationStrategy.send(currentNotificationPayload);

    await this.awsSqsService.deleteMessage(
      this.notificationQueueUrl,
      message.ReceiptHandle,
    );
  }
}
