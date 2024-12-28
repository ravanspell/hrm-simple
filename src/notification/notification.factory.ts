import { Injectable } from '@nestjs/common';
import { EmailStrategy } from './strategies/email/email.strategy';
import { NotificationStrategy } from './notification.strategy.interface';

@Injectable()
export class NotificationFactory {
  private strategies: { [key: string]: NotificationStrategy } = {};

  constructor(private readonly emailStrategy: EmailStrategy) {
    this.strategies['email'] = this.emailStrategy;
    // Register additional strategies here
  }

  getStrategy(type: string): NotificationStrategy {
    const strategy = this.strategies[type];
    if (!strategy) {
      throw new Error(`Notification strategy "${type}" is not supported.`);
    }
    return strategy;
  }
}
