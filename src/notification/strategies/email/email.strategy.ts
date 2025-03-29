import { Injectable, NotFoundException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { NotificationStrategy } from '../../notification.strategy.interface';
import { EmailSettingsService } from 'src/email-settings/email-settings.service';
import { NotificationTypePayloads } from '@/notification/notification.service';
import { UserService } from '@/user/user.service';
import { NOTIFICATION_TYPE } from '@/constants/notifications';

@Injectable()
export class EmailStrategy implements NotificationStrategy {
  readonly type: string = NOTIFICATION_TYPE.EMAIL;

  constructor(
    private readonly emailSettingsService: EmailSettingsService,
    private readonly userService: UserService,
  ) {}

  /**
   * Sends an email notification to a user.
   *
   *
   * @param notificationPayload - Contains userId, subject, and body of the email.
   * @throws NotFoundException if email settings are not found for the organization.
   * @returns A promise that resolves when the email is sent.
   */
  async send(
    notificationPayload: NotificationTypePayloads['email'],
  ): Promise<void> {
    // Fetch primary email settings for the organization
    const userData = await this.userService.findUserByUserId(
      notificationPayload.userId,
    );
    const emailSettings = await this.emailSettingsService.getEmailSettings(
      userData.organizationId,
    );

    if (!emailSettings) {
      throw new NotFoundException(`Email settings not found for organization`);
    }
    // Create a Nodemailer transporter with the organization's email settings
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
      to: userData.email,
      subject: notificationPayload.subject,
      text: notificationPayload.body,
      // html: '<b>Hello world?</b>' // If sending HTML emails
    };
    // Send the email using the configured transporter
    await transporter.sendMail(mailOptions);
  }
}
