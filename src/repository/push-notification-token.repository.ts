import { NotificationToken } from '@/notification/entities/push-notification-token.entity';
import { Injectable } from '@nestjs/common';
import { DataSource, DeleteResult, In, LessThan, Repository } from 'typeorm';

@Injectable()
export class PushNotificationTokenRepository extends Repository<NotificationToken> {
  constructor(private dataSource: DataSource) {
    super(NotificationToken, dataSource.createEntityManager());
  }

  /**
   * Upserts a notification token for a user
   * @param userId - The user ID
   * @param fcmToken - The FCM token
   * @returns Promise<NotificationToken>
   */
  async upsertToken(
    userId: string,
    fcmToken: string,
  ): Promise<NotificationToken> {
    const token = await this.findOne({
      where: { fcmToken },
    });

    if (token) {
      // Update existing token
      token.userId = userId;
      token.lastUsedAt = new Date();
      token.isActive = true;
      return this.save(token);
    }

    // Create new token
    return this.save(
      this.create({
        userId,
        fcmToken,
        isActive: true,
        lastUsedAt: new Date(),
      }),
    );
  }

  /**
   * Gets all active tokens for a user
   * @param userId - The user ID
   * @returns Promise<NotificationToken[]>
   */
  async getActiveTokensForUser(userId: string): Promise<NotificationToken[]> {
    return this.find({
      where: {
        userId,
        isActive: true,
      },
      order: {
        lastUsedAt: 'DESC',
      },
    });
  }

  /**
   * Deactivates tokens that haven't been used in the specified days
   * @param days - Number of days of inactivity
   * @returns Promise<number> - Number of tokens deactivated
   */
  async deactivateStaleTokens(days: number): Promise<number> {
    const staleDate = new Date();
    staleDate.setDate(staleDate.getDate() - days);

    const result = await this.update(
      {
        isActive: true,
        lastUsedAt: LessThan(staleDate),
      },
      {
        isActive: false,
      },
    );

    return result.affected || 0;
  }

  /**
   * Updates the last used timestamp for a token
   * @param fcmToken - The FCM token
   * @returns Promise<boolean> - Whether the token was found and updated
   */
  async updateTokenUsage(fcmToken: string): Promise<boolean> {
    const result = await this.update({ fcmToken }, { lastUsedAt: new Date() });

    return result.affected > 0;
  }

  /**
   * Remove FCM tokens
   * @param tokens - Array of FCM tokens to deleted.
   * @returns Promise<DeleteResult>
   */
  async deleteTokens(tokens: string[]): Promise<DeleteResult> {
    return await this.delete({
      fcmToken: In(tokens),
    });
  }
}
