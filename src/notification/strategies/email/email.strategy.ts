import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { NotificationStrategy } from '../../notification.strategy.interface';
import { EmailSettingsService } from 'src/email-settings/email-settings.service';

@Injectable()
export class EmailStrategy implements NotificationStrategy {
  private transporter;

  constructor(private readonly emailSettingsService: EmailSettingsService) {}

  async send(to: string, data: { subject: string; body: string }) {
    this.emailSettingsService.getEmailSettings('orgid','settingsId');
    nodemailer.createTransport({
      service: this.configService.get<string>('EMAIL_SERVICE'),
      auth: {
        user: this.configService.get<string>('EMAIL_USER'),
        pass: this.configService.get<string>('EMAIL_PASS'),
      },
    const mailOptions = {
      from: this.configService.get<string>('EMAIL_FROM'),
      to,
      subject: data.subject,
      text: data.body,
    };

    await this.transporter.sendMail(mailOptions);
  }
}
