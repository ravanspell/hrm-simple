import { Controller, Get, Patch, Param } from '@nestjs/common';
import { ApiTags, ApiParam, ApiResponse } from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import { NotificationResponseDto } from './dto/notification-response.dto';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  /**
   * Retrieves all notifications for a specific user.
   * @param userId - The user ID.
   * @returns Array of notifications.
   */
  @Get(':userId')
  @ApiParam({ name: 'userId', description: 'The ID of the user' })
  @ApiResponse({
    status: 200,
    description: 'Array of user notifications',
    type: [NotificationResponseDto],
  })
  async getUserNotifications(
    @Param('userId') userId: string,
  ): Promise<NotificationResponseDto[]> {
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
  @ApiParam({
    name: 'notificationId',
    description: 'The ID of the notification to mark as read',
  })
  @ApiResponse({ status: 204, description: 'Notification marked as read' })
  async markAsRead(
    @Param('notificationId') notificationId: string,
  ): Promise<void> {
    await this.notificationService.markNotificationAsRead(notificationId);
  }
}
