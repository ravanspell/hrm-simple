import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CreateEmailSettingsDto } from './dto/create-email-setting.dto';
import { UpdateEmailSettingDto } from './dto/update-email-setting.dto';
import { EncryptionService } from 'src/utilities/encryption/encryption.service';
import { EmailSettings, PrismaClient } from '@prisma/client';

@Injectable()
export class EmailSettingsService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly encryptionService: EncryptionService,
  ) { }

  async create(createDto: CreateEmailSettingsDto) {
    // Encrypt the email authentication password
    const encryptedPassword = this.encryptionService.encrypt(createDto.emailAuthPassword);
    // start transaction for email setting creation
    return this.databaseService.$transaction(async (tx: PrismaClient) => {
      // If isPrimary is true, unset other primary email settings for the organization
      if (createDto.isPrimary) {
        const currentPrimaryEmailSetting = await this.findPrimaryEmailSettings(createDto.organizationId, tx);
        if (currentPrimaryEmailSetting) {
          await this.update(currentPrimaryEmailSetting.id, {
            ...currentPrimaryEmailSetting,
            isPrimary: false,
          });
        }
      }
      const newEmailSetting = {
        emailHost: createDto.emailHost,
        emailPort: createDto.emailPort,
        displayName: createDto.displayName,
        defaultFromEmail: createDto.defaultFromEmail,
        emailHostUsername: createDto.emailHostUsername,
        emailAuthPassword: encryptedPassword,
        useTLS: createDto.useTLS ?? false,
        useSSL: createDto.useSSL ?? false,
        isPrimary: createDto.isPrimary ?? false,
        emailSendTimeout: createDto.emailSendTimeout ?? 30000,
        organization: {
          connect: { id: createDto.organizationId },
        },
      };
      await tx.emailSettings.create({ data: newEmailSetting });
      // create shalow copy of the created 
      const emailSettings = { ...newEmailSetting }
      delete emailSettings.emailAuthPassword;
      delete emailSettings.organization;
      return emailSettings;
    });
  }

  async findAllByOrganization(organizationId: string) {
    return this.databaseService.emailSettings.findMany({
      select: {
        id: true,
        emailHost: true,
        emailPort: true,
        displayName: true,
        defaultFromEmail: true,
        emailHostUsername: true,
        useTLS: true,
        useSSL: true,
        isPrimary: true,
      },
      where: { organizationId },
    });
  }

  async update(id: string, updateDto: UpdateEmailSettingDto) {
    // If updating the password, encrypt it
    if (updateDto.emailAuthPassword) {
      updateDto.emailAuthPassword = this.encryptionService.encrypt(
        updateDto.emailAuthPassword,
      );
      delete updateDto.emailAuthPassword;
    }

    return this.databaseService.$transaction(async (tx: PrismaClient) => {
      // If isPrimary is true, unset other primary email settings for the organization
      if (updateDto.isPrimary) {
        const currentPrimaryEmailSetting = await this.findPrimaryEmailSettings(updateDto.organizationId, tx);
        if (currentPrimaryEmailSetting) {
          await this.update(currentPrimaryEmailSetting.id, {
            ...currentPrimaryEmailSetting,
            isPrimary: false,
          });
        }
      }
      return tx.emailSettings.update({
        where: { id },
        data: updateDto
      });
    });
  }

  async remove(id: string) {
    return this.databaseService.emailSettings.delete({
      where: { id },
    });
  }

  /**
   * Return the primary email settings of the org
   * @param organizationId 
   * @param dbServiceForTransactions Prisma client for transactions!
   * @returns EmailSettings
 */
  async findPrimaryEmailSettings(organizationId: string, dbServiceForTransactions: PrismaClient = null): Promise<EmailSettings> {
    return await (dbServiceForTransactions).emailSettings.findFirst({
      where: {
        organizationId,
        isPrimary: true,
      },
    });
  }

  async getEmailSettings(organizationId: string, emailSettingId: string): Promise<EmailSettings> {
    const where = { organizationId }
    if (emailSettingId) {
      where['id'] = emailSettingId;
    }
    const emailSettings = await this.databaseService.emailSettings.findFirst({
      where,
    });

    return {
      ...emailSettings,
      emailAuthPassword: this.encryptionService.decrypt(emailSettings.emailAuthPassword)
    }
  }
}
