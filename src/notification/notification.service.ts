import { Injectable } from '@nestjs/common';
import { EmailService } from './email/email.service';

@Injectable()
export class NotificationService {
  constructor(
    private readonly emailService: EmailService,
    private readonly pushService: PushService,
  ) {}

  async sendEmail(to: string, subject: string, body: string) {
    return this.emailService.sendEmail(to, subject, body);
  }

  // You can add more generic methods or handle multiple notifications here
}
