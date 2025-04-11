import { Injectable, OnModuleInit } from '@nestjs/common';
import { EC2Client, StopInstancesCommand } from '@aws-sdk/client-ec2';
import { ConfigService } from '@nestjs/config';
import { CommonUtilitiesService } from './utilities/environment/common.utilities.service';
import { ENVIRONMENT } from './constants/common';

/**
 * Service responsible for managing EC2 instance auto-shutdown functionality.
 * This service implements an inactivity timer that will shutdown the EC2 instance
 * after a period of no API activity in development environment.
 */
@Injectable()
export class AppService implements OnModuleInit {
  private readonly TIMEOUT_MINUTES = 20;
  private timer: NodeJS.Timeout;
  private ec2Client: EC2Client;

  constructor(
    private configService: ConfigService,
    private commonUtilitiesService: CommonUtilitiesService,
  ) {
    // Initialize EC2 client with credentials from .env
    this.ec2Client = new EC2Client({
      region: this.configService.get<string>('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get<string>(
          'AWS_SECRET_ACCESS_KEY',
        ),
      },
    });
  }

  /**
   * Lifecycle hook that runs when the module is initialized.
   * Starts the inactivity timer if in development environment.
   */
  onModuleInit(): void {
    if (
      this.commonUtilitiesService.getCurrentEnvironment() !==
      ENVIRONMENT.DEVELOPMENT
    ) {
      console.log(
        'Timer shutdown functionality is disabled in non-dev environments',
      );
      return;
    }
    this.resetTimer();
  }

  getHello(): string {
    return `Hello World!`;
  }

  /**
   * Updates the inactivity timer. This method should be called whenever there is API activity
   * to prevent the EC2 instance from shutting down.
   * @returns Object containing status message and time until next shutdown
   */
  async updateActivityTimer(): Promise<{
    message: string;
    nextShutdownIn?: string;
  }> {
    if (
      this.commonUtilitiesService.getCurrentEnvironment() !==
      ENVIRONMENT.DEVELOPMENT
    ) {
      return {
        message: 'Timer functionality is only available in dev environment',
      };
    }
    this.resetTimer();
    return {
      message: 'Activity timer updated',
      nextShutdownIn: `${this.TIMEOUT_MINUTES} minutes`,
    };
  }

  /**
   * Resets the inactivity timer. Clears any existing timer and starts a new one.
   * When the timer expires, it will trigger the EC2 instance shutdown.
   * @private
   */
  private resetTimer(): void {
    if (this.timer) {
      clearTimeout(this.timer);
    }

    this.timer = setTimeout(
      () => this.shutdownEC2Instance(),
      this.TIMEOUT_MINUTES * 60 * 1000, // 20 minutes
    );
  }

  /**
   * Initiates the shutdown sequence for the EC2 instance.
   * Uses AWS SDK to send a stop command to the specified instance.
   * @private
   */
  private async shutdownEC2Instance(): Promise<void> {
    try {
      console.log('EC2 instance shutdown initiated due to inactivity');
      const command = new StopInstancesCommand({
        InstanceIds: [this.configService.get<string>('EC2_INSTANCE_ID')],
      });

      await this.ec2Client.send(command);
    } catch (error) {
      console.error('Failed to shutdown EC2 instance:', error);
    }
  }
}
