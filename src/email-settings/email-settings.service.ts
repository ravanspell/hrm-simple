import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CreateEmailSettingsDto } from './dto/create-email-setting.dto';
import { UpdateEmailSettingDto } from './dto/update-email-setting.dto';
import { EncryptionService } from 'src/utilities/encryption/encryption.service';

@Injectable()
export class EmailSettingsService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly encryptionService: EncryptionService,
  ) {}

  async create(createDto: CreateEmailSettingsDto) {
    // Encrypt the email authentication password
    const encryptedPassword = this.encryptionService.encrypt(createDto.emailAuthPassword);

    // If isPrimary is true, unset other primary email settings for the organization
    if (createDto.isPrimary) {
      await this.databaseService.emailSettings.updateMany({
        where: {
          organizationId: createDto.organizationId,
          isPrimary: true,
        },
        data: {
          isPrimary: false,
        },
      });
    }

    return this.databaseService.emailSettings.create({
      data: {
        emailHost: createDto.emailHost,
        emailPort: createDto.emailPort,
        displayName: createDto.displayName,
        defaultFromEmail: createDto.defaultFromEmail,
        emailHostUsername: createDto.emailHostUsername,
        encryptedEmailAuthPassword: encryptedPassword,
        useTLS: createDto.useTLS ?? false,
        useSSL: createDto.useSSL ?? false,
        isPrimary: createDto.isPrimary ?? false,
        emailSendTimeout: createDto.emailSendTimeout ?? 30000,
        organization: {
          connect: { id: createDto.organizationId },
        },
      },
    });
  }

  async findAllByOrganization(organizationId: string) {
    return this.databaseService.emailSettings.findMany({
      where: { organizationId },
    });
  }

  async findPrimaryByOrganization(organizationId: string) {
    const primary = await this.databaseService.emailSettings.findFirst({
      where: {
        organizationId,
        isPrimary: true,
      },
    });

    if (!primary) {
      throw new NotFoundException('Primary email settings not found for this organization.');
    }

    return primary;
  }

  async update(id: string, updateDto: UpdateEmailSettingDto) {
    const emailSettings = await this.databaseService.emailSettings.findUnique({
      where: { id },
    });

    if (!emailSettings) {
      throw new NotFoundException('Email settings not found.');
    }

    // If updating the password, encrypt it
    if (updateDto.emailAuthPassword) {
      updateDto.emailAuthPassword = this.encryptionService.encrypt(
        updateDto.emailAuthPassword,
      );
      delete updateDto.emailAuthPassword;
    }

    // If setting this as primary, unset others
    if (updateDto.isPrimary) {
      await this.databaseService.emailSettings.updateMany({
        where: {
          organizationId: emailSettings.organizationId,
          isPrimary: true,
          id: { not: id },
        },
        data: {
          isPrimary: false,
        },
      });
    }

    return this.databaseService.emailSettings.update({
      where: { id },
      data: updateDto
    });
  }

  async remove(id: string) {
    const emailSettings = await this.databaseService.emailSettings.findUnique({
      where: { id },
    });

    if (!emailSettings) {
      throw new NotFoundException('Email settings not found.');
    }

    return this.databaseService.emailSettings.delete({
      where: { id },
    });
  }

  async getEmailSettings(organizationId: string, emailSettingId: string): Promise<any> {
    const where = {organizationId}
    if(emailSettingId) {
      where['id'] = emailSettingId;
    }
    const emailSettings = await this.databaseService.emailSettings.findUnique({
      where,
    });

    if (!emailSettings) {
      throw new NotFoundException('Email settings not found.');
    }

    return {
      ...emailSettings,
      emailAuthPassword: this.encryptionService.decrypt(emailSettings.)
    }
  }
}
