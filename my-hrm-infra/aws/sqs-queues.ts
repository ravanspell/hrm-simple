/**
 * Defines AWS SQS configurations using CDKTF.
 *
 * It creates two SQS queues:
 * 1. notificationSQS: A queue for processing notifications, ensuring reliable message delivery.
 * 2. NotificationDeadLetterQueue: A dead-letter queue to capture messages that could not be processed successfully.
 *
 * Key Features:
 * - notificationSQS includes default visibility timeout, message retention period, and integration with the NotificationDeadLetterQueue.
 * - NotificationDeadLetterQueue is used to store undeliverable messages for further analysis.
 * - Both queues are configured with server-side encryption for secure message storage.
 *
 * References:
 * - AWS SQS Terraform Provider: https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/sqs_queue
 */
import { Construct } from 'constructs';
import { SqsQueue } from '@cdktf/provider-aws/lib/sqs-queue';
import { SqsQueuePolicy } from '@cdktf/provider-aws/lib/sqs-queue-policy';
import { NOTIFICATION_DEAD_LETTER_QUEUE, NOTIFICATION_QUEUE } from './constants';

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

    /**
     * SQS Queue Policy for the DLQ
     * ----------------------------
     * 
     * The policy grants the `sqs.amazonaws.com` service permission to perform
     * the `sqs:SendMessage` action on the DLQ. A condition ensures that only
     * messages from the specific source queue can be sent to the DLQ.
     */
    new SqsQueuePolicy(this, "NotificationDLQPolicy", {
      queueUrl: notificationDeadLetterQueue.url, // URL of the DLQ
      policy: JSON.stringify({
        Version: "2012-10-17",
        Statement: [
          {
            Effect: "Allow",
            Principal: {
              Service: "sqs.amazonaws.com",
            },
            Action: "sqs:SendMessage",
            Resource: notificationDeadLetterQueue.arn,
            Condition: {
              ArnEquals: {
                "aws:SourceArn": notificationQueue.arn, // Restrict to the source queue
              },
            },
          },
        ],
      })
    });
  }
}
