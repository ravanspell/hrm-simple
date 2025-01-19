import { Injectable, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { ConfigService } from '@nestjs/config';

export interface FCMNotificationPayload {
  title: string;
  body: string;
  imageUrl?: string;
  data?: Record<string, string>;
}

export interface FCMResponse {
  success: boolean;
  successCount?: number;
  failureCount?: number;
  failedTokens?: string[];
}

@Injectable()
export class FirebaseService implements OnModuleInit {
  constructor(private readonly configService: ConfigService) {}

  /**
   * Initializes the Firebase Admin SDK with credentials from environment
   *
   * @throws Error - If the Firebase initialization fails.
   */
  onModuleInit(): void {
    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: this.configService.get<string>('FIREBASE_PROJECT_ID'),
          privateKey: this.configService
            .get<string>('FIREBASE_PRIVATE_KEY')
            .replace(/\\n/g, '\n'),
          clientEmail: this.configService.get<string>('FIREBASE_CLIENT_EMAIL'),
        }),
      });
    } catch (error) {
      throw new Error(`Firebase initialization failed: ${error.message}`);
    }
  }
  /**
   * Sends notifications to one or more FCM tokens.
   *
   * @param tokens - An array of FCM tokens to which the notification will be sent.
   * @param payload - The notification payload including title, body, imageUrl, and additional data.
   * @param retries - Number of remaining retries.
   * @returns A response indicating success, failure counts, and failed tokens, if any.
   * @example
   * ```typescript
   * const tokens = ['token1', 'token2'];
   * const payload = { title: 'Hello', body: 'World' };
   * const response = await firebaseService.sendNotification(tokens, payload);
   * console.log(response);
   * ```
   */
  async sendNotification(
    tokens: string[],
    payload: FCMNotificationPayload,
    retries = 3,
  ): Promise<FCMResponse> {
    if (retries === 0 || tokens.length === 0) {
      return {
        success: tokens.length === 0,
        successCount: 0,
        failureCount: tokens.length,
        failedTokens: tokens,
      };
    }

    const message: admin.messaging.MulticastMessage = {
      tokens,
      notification: {
        title: payload.title,
        body: payload.body,
        imageUrl: payload.imageUrl,
      },
      data: payload.data,
    };

    try {
      const response = await admin.messaging().sendEachForMulticast(message);

      // Separate successful and failed tokens
      const failedTokens: string[] = [];
      const successfulTokens: string[] = [];

      response.responses.forEach((res, idx) => {
        if (res.success) {
          successfulTokens.push(tokens[idx]);
        } else {
          failedTokens.push(tokens[idx]);
        }
      });

      // Retry for failed tokens
      const retryResponse = await this.sendNotification(
        failedTokens,
        payload,
        retries - 1,
      );

      return {
        success: retryResponse.failedTokens.length === 0,
        successCount: response.successCount + retryResponse.successCount,
        failureCount: retryResponse.failedTokens.length,
        failedTokens: retryResponse.failedTokens,
      };
    } catch (error) {
      return {
        success: false,
        successCount: 0,
        failureCount: tokens.length,
        failedTokens: tokens,
      };
    }
  }
}
