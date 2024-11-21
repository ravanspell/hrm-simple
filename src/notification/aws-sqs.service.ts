import { Injectable } from '@nestjs/common';
import {
  SQSClient,
  SendMessageCommand,
  ReceiveMessageCommand,
  DeleteMessageCommand,
  DeleteMessageCommandOutput,
  SendMessageCommandOutput,
} from '@aws-sdk/client-sqs';

/**
 * AWS SQS Service
 * 
 * This service provides utility methods for interacting with AWS Simple Queue Service (SQS).
 * It includes methods for sending messages, receiving messages, and deleting messages.
 * 
 * Designed to be reusable across different modules (e.g., notifications, logging) in your application.
 */
@Injectable()
export class AwsSqsService {
  private readonly sqsClient: SQSClient;

  constructor() {
    this.sqsClient = new SQSClient({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }

  /**
   * Publish a message to an SQS queue.
   * 
   * @param queueUrl - The URL of the SQS queue.
   * @param messageBody - The content of the message.
   * @param messageAttributes - Optional attributes to categorize or filter messages.
   * @returns A Promise that resolves when the message is sent successfully.
   * 
   * @example
   * await awsSqsService.publishMessage(
   *   'https://sqs.us-east-1.amazonaws.com/123456789012/MyQueue',
   *   JSON.stringify({ type: 'notification', payload: { ... } }),
   *   { Type: 'String', StringValue: 'notification' }
   * );
   */
  async publishMessage(queueUrl: string, messageBody: string, messageAttributes: Record<string, any>): Promise<SendMessageCommandOutput> {
    const command = new SendMessageCommand({
      QueueUrl: queueUrl,
      MessageBody: messageBody,
      MessageAttributes: Object.keys(messageAttributes).reduce((acc, key) => {
        acc[key] = {
          DataType: 'String',
          StringValue: messageAttributes[key],
        };
        return acc;
      }, {}),
    });

    return await this.sqsClient.send(command);
  }

  /**
   * Receive messages from an SQS queue.
   * 
   * This method supports long polling to minimize costs by waiting for messages to arrive
   * before returning a response.
   * 
   * @param queueUrl - The URL of the SQS queue.
   * @param maxMessages - The maximum number of messages to retrieve (default: 1).
   * @param waitTimeSeconds - The wait time for long polling (@default: 10 seconds).
   * @returns A Promise that resolves to an array of messages.
   * 
   * @example
   * const messages = await awsSqsService.receiveMessages(
   *   'https://sqs.us-east-1.amazonaws.com/123456789012/MyQueue',
   *   5,
   *   20
   * );
   */
  async receiveMessages(queueUrl: string, maxMessages = 1, waitTimeSeconds = 10): Promise<any[]> {
    const command = new ReceiveMessageCommand({
      QueueUrl: queueUrl,
      MaxNumberOfMessages: maxMessages,
      WaitTimeSeconds: waitTimeSeconds, // Long polling to minimize empty responses
      MessageAttributeNames: ['All'], // Retrieve all message attributes
    });

    const response = await this.sqsClient.send(command);
    return response.Messages || [];
  }

  /**
   * Delete a message from an SQS queue.
   * 
   * This method is typically called after successfully processing a message to
   * ensure it is removed from the queue.
   * 
   * @param queueUrl - The URL of the SQS queue.
   * @param receiptHandle - The receipt handle of the message to delete.
   * @returns A Promise that resolves when the message is deleted successfully.
   * 
   * @example
   * await awsSqsService.deleteMessage(
   *   'https://sqs.us-east-1.amazonaws.com/123456789012/MyQueue',
   *   'AQEBzFV++/example-receipt-handle'
   * );
   */
  async deleteMessage(queueUrl: string, receiptHandle: string): Promise<DeleteMessageCommandOutput> {
    const command = new DeleteMessageCommand({
      QueueUrl: queueUrl,
      ReceiptHandle: receiptHandle,
    });
    return await this.sqsClient.send(command);
  }
}
