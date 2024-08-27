/**
 * the AWS Cloudwatch logs integratons. this service is temporary until the API
 * move to AWS itself. This will be a Facade service to hold the API actions and error loging
 * this service also helps to retrive users logs to show who did what.
 * 
 * By: Ireshan Pathirana
 */
import { Injectable } from '@nestjs/common';
import {
    CloudWatchLogsClient,
    PutLogEventsCommand,
    FilterLogEventsCommand,
    PutLogEventsCommandInput
} from '@aws-sdk/client-cloudwatch-logs';

@Injectable()
export class LoggerService {
    private client: CloudWatchLogsClient;
    private logGroupName = 'EmployeeActions';
    private logStreamName = 'HRActivities';

    constructor() {
        this.client = new CloudWatchLogsClient({
            region: process.env.AWS_REGION,
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            },
        });
    }
    /**
     * Use to track employee actions across the application
     * @param employeeId current employeeId
     * @param action what employee did
     */
    async logEmployeeAction(employeeId: string, action: string): Promise<void> {
        const timestamp = new Date().getTime();
        const message = JSON.stringify({
            employeeId,
            action,
            timestamp: new Date().toISOString(),
        });

        const input: PutLogEventsCommandInput = {
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
        }
    }
    /**
     * returns user's actions log from AWS cloudwatch
     * @param employeeId 
     * @param startTime 
     * @param endTime 
     * @returns logs
     */
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
        }
    }
}
