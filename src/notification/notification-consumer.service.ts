import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { AwsSqsService } from '../utilities/aws-sqs-service/aws-sqs.service';
import { ConfigService } from '@nestjs/config';
import { Message } from '@aws-sdk/client-sqs';
import { NotificationStrategy } from './notification.strategy.interface';


@Injectable()
export class NotificationConsumerService implements OnModuleInit, OnModuleDestroy {
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

    async onModuleInit() {
        this.pollNotificationsQueue();
    }

    async onModuleDestroy() {
        this.queuePolling = false;
    }

    registerStrategy(strategy: NotificationStrategy) {
        this.strategies.set(strategy.type, strategy);
    }

    getStrategy(type: string): NotificationStrategy | undefined {
        return this.strategies.get(type);
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
                    console.log('messages-->', messages);
                    if (messages.length > 0) {
                        console.log(`Received ${messages.length} messages`);

                        const results = await Promise.allSettled(
                            messages.map((message) => this.sendNotifications(message))
                        );

                        // Log the results
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
        setImmediate(poll); // Start the initial poll immediately without delay
    }

    private async sendNotifications(message: Message) {
        await this.delay(20000);
        console.log('message has been sent', message);
        const notificationPayLoad = JSON.parse(message?.Body);
        console.log("notificationType--->", notificationPayLoad);
        console.log("strategies", this.strategies);
        const notificationStategyType =  notificationPayLoad.type;
        const notificationStrategy = this.getStrategy(notificationStategyType);
        if (!notificationStrategy) {
            throw new Error(`Strategy not found: ${notificationStategyType}`);
        }
        await notificationStrategy.send('001d9ff0-80f3-40ba-8ffe-48e1b7dc9730', notificationPayLoad)

        await this.awsSqsService.deleteMessage(
            this.notificationQueueUrl,
            message.ReceiptHandle,
        )
    }

    private delay(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
