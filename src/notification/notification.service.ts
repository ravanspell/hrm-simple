import { Injectable } from '@nestjs/common';
import { EmailStrategy } from './strategies/email/email.strategy';

@Injectable()
export class NotificationService {
  constructor(
    private readonly emailStrategy: EmailStrategy,
  ) { }

  async sendEmail(to: string, subject: string, body: string) {
    return this.emailStrategy.send(to, { subject, body });
  }
}
