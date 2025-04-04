import { Injectable } from '@nestjs/common';
import * as Sentry from '@sentry/node';

/**
 * SentryService provides methods for error tracking and monitoring using Sentry.
 * This service is injectable and can be used throughout the application to capture
 * exceptions and messages with additional context.
 *
 * Usage example:
 * ```typescript
 * @Injectable()
 * export class YourService {
 *   constructor(private readonly sentryService: SentryService) {}
 *
 *   async someMethod() {
 *     try {
 *       // Your code here
 *     } catch (error) {
 *       this.sentryService.captureException(error, {
 *         method: 'someMethod',
 *         userId: '123',
 *         additionalData: 'some value'
 *       });
 *     }
 *   }
 * }
 * ```
 */
@Injectable()
export class SentryService {
  /**
   * Captures an exception with optional context information.
   * This method is useful for tracking errors that occur in your application.
   *
   * @param error - The Error object to capture
   * @param context - Optional additional context information to attach to the error
   *                 This can include any relevant data that would help debug the issue
   *                 such as user ID, request data, or application state
   *
   * Example:
   * ```typescript
   * try {
   *   // Some code that might throw
   * } catch (error) {
   *   this.sentryService.captureException(error, {
   *     userId: user.id,
   *     action: 'processPayment',
   *     paymentId: payment.id
   *   });
   * }
   * ```
   */
  captureException(error: Error, context?: Record<string, any>) {
    Sentry.withScope((scope) => {
      if (context) {
        Object.entries(context).forEach(([key, value]) => {
          scope.setExtra(key, value);
        });
      }
      Sentry.captureException(error);
    });
  }

  /**
   * Captures a message with optional severity level and context information.
   * This method is useful for tracking important events or state changes in your application.
   *
   * @param message - The message to capture
   * @param level - The severity level of the message ('info' | 'warning' | 'error')
   * @param context - Optional additional context information to attach to the message
   *
   * Example:
   * ```typescript
   * this.sentryService.captureMessage(
   *   'User completed onboarding',
   *   'info',
   *   {
   *     userId: user.id,
   *     completedSteps: user.onboardingSteps,
   *     timeSpent: '5m 30s'
   *   }
   * );
   * ```
   */
  captureMessage(
    message: string,
    level: Sentry.SeverityLevel = 'info',
    context?: Record<string, any>,
  ) {
    Sentry.withScope((scope) => {
      if (context) {
        Object.entries(context).forEach(([key, value]) => {
          scope.setExtra(key, value);
        });
      }
      Sentry.captureMessage(message, level);
    });
  }
}
