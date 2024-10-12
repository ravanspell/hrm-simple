import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { NotificationStrategy } from '../../notification.strategy.interface';
import { EmailSettingsService } from 'src/email-settings/email-settings.service';

@Injectable()
export class EmailStrategy implements NotificationStrategy {
  private transporter;

  constructor(private readonly emailSettingsService: EmailSettingsService) {}

  async send(to: string, data: { subject: string; body: string }) {
    this.emailSettingsService.getEmailSettings('orgid','settingsId');
    nodemailer.createTransport({
      service: '',
      auth: {
        user: '',
        pass: '',
      }
    });
    const mailOptions = {
      from: '',
      to,
      subject: data.subject,
      text: data.body,
    };

    await this.transporter.sendMail(mailOptions);
  }
}
