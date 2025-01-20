import { Injectable } from '@nestjs/common';
import { NotificationStrategy } from '../../notification.strategy.interface';
import { NotificationTokenRepository } from '@/repository/notification-token.repository';
import {
  FCMResponse,
  FirebaseService,
} from '@/utilities/firebase-admin-service/firebase-admin.service';

@Injectable()
export class WebPushNotificationStrategy implements NotificationStrategy {
  readonly type: string = 'webPush';

  constructor(
    private readonly NotificationTokenRepository: NotificationTokenRepository,
    private readonly firebaseService: FirebaseService,
  ) {}

  async send(to: string, data: any): Promise<void> {
    console.log('excuted--->');
    const userId = 'userId';
    const tokens = await this.getActiveTokensForUser(userId);
    if (tokens.length > 0) {
      const response = await this.sendNotificationToTokens(tokens, data);
      await this.handleNotificationResponse(response);
    }
  }

  /**
   * Retrieves active FCM tokens for a user.
   * @param userId - The user's ID.
   * @returns Array of active tokens.
   * @throws NotFoundException if no tokens are found.
   */
  private async getActiveTokensForUser(userId: string): Promise<string[]> {
    const activeTokens =
      await this.NotificationTokenRepository.getActiveTokensForUser(userId);
    if (!activeTokens.length) {
      throw new Error('No active devices found for the user.');
    }
    return activeTokens.map((token) => token.fcmToken);
  }

  /**
   * Sends a notification to the provided FCM tokens.
   * @param tokens - Array of FCM tokens.
   * @param payload - The notification payload.
   * @returns Firebase multicast response.
   */
  private async sendNotificationToTokens(
    tokens: string[],
    payload: any,
  ): Promise<FCMResponse> {
    return this.firebaseService.sendNotification(tokens, {
      title: payload.title,
      body: payload.body,
      imageUrl: payload.imageUrl,
      data: payload.data,
    });
  }

  /**
   * Handles the Firebase response to manage token states.
   * delete failed tokens
   * @param response - FCMResponse The response from Firebase.
   */
  private async handleNotificationResponse(
    response: FCMResponse,
  ): Promise<void> {
    // Deactivate failed tokens
    if (response.failedTokens?.length) {
      await this.NotificationTokenRepository.deleteTokens(
        response.failedTokens,
      );
    }
    // Log the response summary
    console.log(
      `Notification sent: ${response.successCount} succeeded, ${response.failureCount} failed.`,
    );
  }
}
