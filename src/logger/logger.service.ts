import { Injectable } from '@nestjs/common';
import {
  CloudWatchLogsClient,
  PutLogEventsCommand,
  FilterLogEventsCommand,
} from '@aws-sdk/client-cloudwatch-logs';

@Injectable()
export class CloudWatchService {
  private client: CloudWatchLogsClient;
  private logGroupName = 'EmployeeActions'; // Your log group name
  private logStreamName = 'HRActivities'; // Your log stream name

  constructor() {
    this.client = new CloudWatchLogsClient({ region: 'us-west-2' }); // Specify your region
  }

  async logEmployeeAction(employeeId: string, action: string): Promise<void> {
    const timestamp = new Date().getTime();
    const message = JSON.stringify({
      employeeId,
      action,
      timestamp: new Date().toISOString(),
    });

    const input = {
      logGroupName: this.logGroupName,
      logStreamName: this.logStreamName,
      logEvents: [
        {
          message,
          timestamp,
        },
      ],
    };

    const command = new PutLogEventsCommand(input);
    try {
      await this.client.send(command);
    } catch (error) {
      console.error('Error logging employee action:', error);
      throw new Error('Failed to log employee action');
    }
  }

  async queryEmployeeActions(
    employeeId: string,
    startTime: number,
    endTime: number
  ): Promise<any[]> {
    const filterPattern = `{ $.employeeId = "${employeeId}" }`;

    const input = {
      logGroupName: this.logGroupName,
      startTime,
      endTime,
      filterPattern,
    };

    const command = new FilterLogEventsCommand(input);
    try {
      const response = await this.client.send(command);
      return response.events?.map(event =>
        event.message ? JSON.parse(event.message) : null
      );
    } catch (error) {
      console.error('Error querying employee actions:', error);
      throw new Error('Failed to query employee actions');
    }
  }
}
