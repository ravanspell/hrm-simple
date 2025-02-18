import { DataSource, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { Notification } from '@/notification/entities/notification.entity';

@Injectable()
export class NotificationRepository extends Repository<Notification> {
  constructor(private readonly dataSource: DataSource) {
    super(Notification, dataSource.createEntityManager());
  }

  /**
   * Retrieves all notifications for a specific user.
   * @param userId - The user ID.
   * @returns Array of notifications for the user.
   */
  async getNotificationsByUser(userId: string): Promise<Notification[]> {
    return this.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Marks a notification as read.
   * @param notificationId - The notification ID.
   * @returns The updated notification.
   */
  async markAsRead(notificationId: string): Promise<void> {
    await this.update(notificationId, { isRead: true });
  }
}
