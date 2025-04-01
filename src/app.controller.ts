import { Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  /**
   * Basic health check to verify service is running
   * @returns Simple status message
   */
  @Get('health-check')
  getHealthCheck() {
    return this.appService.getHealthCheck();
  }

  /**
   * Updates the inactivity timer. This method should be called whenever there is API activity
   * to prevent the EC2 instance from shutting down.
   * @returns Object containing status message and time until next shutdown
   */
  @Post('update-activity')
  async updateActivity() {
    return this.appService.updateActivityTimer();
  }
}
