import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { NotificationStrategy } from '../../notification.strategy.interface';
import { EmailSettingsService } from 'src/email-settings/email-settings.service';

@Injectable()
export class EmailStrategy implements NotificationStrategy {
  constructor(private readonly emailSettingsService: EmailSettingsService) {}

  async send(to: string, data: any): Promise<void> {
    // Fetch primary email settings for the organization
    const emailSettings =
      await this.emailSettingsService.getEmailSettings('orgId');
    // Create a Nodemailer transporter
    const transporter = nodemailer.createTransport({
      host: emailSettings.emailHost,
      port: emailSettings.emailPort,
      secure: emailSettings.useSSL, // true for 465, false for other ports
      auth: {
        user: emailSettings.emailHostUsername,
        pass: emailSettings.emailAuthPassword,
      },
      tls: {
        rejectUnauthorized: !emailSettings.useTLS,
      },
      // Optional: Set connection timeout
      connectionTimeout: emailSettings.emailSendTimeout,
    });
    // Define email options
    const mailOptions = {
      from: `"${emailSettings.displayName}" <${emailSettings.defaultFromEmail}>`,
      to,
      subject: data,
      text: data,
      // html: '<b>Hello world?</b>' // If sending HTML emails
    };
    // Send the email
    await transporter.sendMail(mailOptions);
  }
}
