import { Construct } from 'constructs';
import { SqsQueue } from '@cdktf/provider-aws/lib/sqs-queue';
import { NOTIFICATION_DEAD_LETTER_QUEUE, NOTIFICATION_QUEUE } from './constants';
import { TerraformOutput } from 'cdktf';

export class SQSQueues extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    /**
     * Dead Letter Queue (DLQ)
     * ------------------------
     * Used to store messages that could not be successfully processed.
     * - Same retention time as the main queue for consistency.
     */
    const notificationDeadLetterQueue = new SqsQueue(this, 'DeadLetterQueue', {
      name: NOTIFICATION_DEAD_LETTER_QUEUE,
      delaySeconds: 0,
      visibilityTimeoutSeconds: 30,
      sqsManagedSseEnabled: true,
      messageRetentionSeconds: 345600, // 4 days
    });

    /**
     * Main Notification Queue
     * -----------------------
     * This queue is used for managing notifications.
     * - Long polling enabled (20 seconds) for efficient message retrieval.
     * - Messages are retained for 4 days (345600 seconds).
     */
    const notificationQueue = new SqsQueue(this, 'NotificationQueue', {
      name: NOTIFICATION_QUEUE,
      delaySeconds: 0,
      visibilityTimeoutSeconds: 30,
      messageRetentionSeconds: 345600, // 4 days
      receiveWaitTimeSeconds: 20, // Long polling
      sqsManagedSseEnabled: true,
      redrivePolicy: JSON.stringify({
        deadLetterTargetArn: notificationDeadLetterQueue.arn,
        maxReceiveCount: 5, // Messages are sent to DLQ after 5 failed attempts
      }),
    });

    new TerraformOutput(this, 'Notification_Dead_letter_Queue_URL', {
      value: notificationDeadLetterQueue.url,
    });

    new TerraformOutput(this, 'Notification_Queue_URL', {
      value: notificationQueue.url,
    });
  }
}
