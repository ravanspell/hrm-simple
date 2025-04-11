import {
  Controller,
  Get,
  Patch,
  Param,
  Req,
  HttpStatus,
  Version,
} from '@nestjs/common';
import { ApiTags, ApiParam, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import { NotificationResponseDto } from './dto/notification-response.dto';
import { RequestWithTenant } from '@/coretypes';
import { Authentication } from '@/decorators/auth.decorator';
import { API_VERSION } from '@/constants/common';

@ApiTags('Notifications')
@Controller('notifications')
@Authentication()
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  /**
   * Retrieves all notifications for the current user.
   * @param req - The request object containing the authenticated user.
   * @returns An array of notifications.
   */
  @Get()
  @Version(API_VERSION.V1)
  @ApiOperation({
    summary: 'Get all notifications for the current user',
    description:
      'Retrieves a list of all notifications for the authenticated user',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Array of user notifications',
    type: [NotificationResponseDto],
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'User is not authenticated',
  })
  async getUserNotifications(
    @Req() req: RequestWithTenant,
  ): Promise<NotificationResponseDto[]> {
    const userId = req.user.id;
    const notifications =
      await this.notificationService.getUserNotifications(userId);
    return notifications.map((n) => ({
      id: n.id,
      title: n.title,
      body: n.body,
      data: n.data,
      isRead: n.isRead,
      createdAt: n.createdAt,
    }));
  }

  /**
   * Marks a notification as read.
   * @param notificationId - The notification ID.
   */
  @Patch(':notificationId')
  @Version(API_VERSION.V1)
  @ApiOperation({
    summary: 'Mark a notification as read',
    description: 'Updates the read status of a specific notification to true',
  })
  @ApiParam({
    name: 'notificationId',
    description: 'The ID of the notification to mark as read',
    type: 'string',
    example: 'notification-123',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Notification successfully marked as read',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Notification not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'User is not authenticated',
  })
  async markAsRead(
    @Param('notificationId') notificationId: string,
  ): Promise<void> {
    await this.notificationService.markNotificationAsRead(notificationId);
  }
}
