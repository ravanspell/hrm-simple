import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { AwsSqsService } from '@/utilities/aws-sqs-service/aws-sqs.service';
import { ConfigService } from '@nestjs/config';
import { Message } from '@aws-sdk/client-sqs';
import { ResumeParserService } from './resume-parser.service';
import { CandidateService } from './candidate.service';
import { createFileData } from '@/file-management/file-management.service';

interface ResumeParserMessage {
  candidateId: string;
  fileName: string;
  s3ObjectKey: string;
  fileSize: number;
  userId: string;
  organizationId: string;
}

@Injectable()
export class ResumeParserConsumerService
  implements OnModuleInit, OnModuleDestroy
{
  private readonly resumeParserQueueUrl: string;
  private readonly resumeParserQueuePollingDelay = 20;
  private readonly resumeParserMessagesBatchSize = 5;

  private queuePolling = true;

  constructor(
    private readonly awsSqsService: AwsSqsService,
    private readonly configService: ConfigService,
    private readonly resumeParserService: ResumeParserService,
    private readonly candidateService: CandidateService,
  ) {
    this.resumeParserQueueUrl = this.configService.get<string>(
      'RESUME_PARSER_QUEUE_URL',
    );
  }

  /**
   * Initializes the resume parser polling process when the module starts.
   */
  async onModuleInit(): Promise<void> {
    this.pollResumeParserQueue();
  }

  /**
   * Stops the resume parser polling process when the module is destroyed.
   */
  async onModuleDestroy(): Promise<void> {
    this.queuePolling = false;
  }

  /**
   * Continuously polls the SQS queue for resume parser messages.
   *
   * Processes each message by parsing the resume and updating the candidate.
   */
  private async pollResumeParserQueue(): Promise<void> {
    const poll = async () => {
      while (this.queuePolling) {
        try {
          const messages = await this.awsSqsService.receiveMessages(
            this.resumeParserQueueUrl,
            this.resumeParserMessagesBatchSize,
            this.resumeParserQueuePollingDelay,
          );

          if (messages.length > 0) {
            console.log(`Received ${messages.length} resume parser messages`);

            const results = await Promise.allSettled(
              messages.map((message) =>
                this.processResumeParserMessage(message),
              ),
            );

            results.forEach((result, index) => {
              if (result.status === 'fulfilled') {
                console.log(
                  `Resume parser message ${index + 1} processed successfully`,
                );
              } else {
                console.error(
                  `Resume parser message ${index + 1} failed:`,
                  result.reason,
                );
              }
            });
          }
        } catch (error) {
          console.error('Error during resume parser polling:', error);
        }
      }
    };
    setImmediate(poll);
  }

  /**
   * Processes a single resume parser message.
   *
   * @param message - The message to process.
   */
  private async processResumeParserMessage(message: Message): Promise<void> {
    try {
      // Parse the queue message into JS object
      const resumeParserPayload = JSON.parse(
        message?.Body,
      ) as ResumeParserMessage;

      // Create file data for the resume parser service
      const fileData: createFileData = {
        fileName: resumeParserPayload.fileName,
        s3ObjectKey: resumeParserPayload.s3ObjectKey,
        fileSize: resumeParserPayload.fileSize,
      };

      // Parse the resume using the provided user and organization IDs
      const { dataForSave } = await this.resumeParserService.parseResume(
        fileData,
        resumeParserPayload.userId,
        resumeParserPayload.organizationId,
      );

      // Update the candidate with the parsed data
      await this.candidateService.update(resumeParserPayload.candidateId, {
        firstName: dataForSave.firstName || 'Unknown',
        lastName: dataForSave.lastName || 'Unknown',
        email: dataForSave.email || '',
        phone: dataForSave.phone || '',
        currentPosition: dataForSave.currentPosition || '',
        resume: {
          structuredData: dataForSave.structuredResume,
          jobMatching: dataForSave.jobMatching,
          recommendations: dataForSave.recommendations,
          metadata: dataForSave.metadata || {},
        },
        status: 'REVIEWING', // Update status from PROCESSING to REVIEWING
      });

      // Delete the message from the queue
      await this.awsSqsService.deleteMessage(
        this.resumeParserQueueUrl,
        message.ReceiptHandle,
      );
    } catch (error) {
      console.error('Error processing resume parser message:', error);
      // We don't delete the message from the queue if there's an error
      // This allows for retry mechanisms
    }
  }
}
