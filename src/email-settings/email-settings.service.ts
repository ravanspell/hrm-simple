import { Injectable } from '@nestjs/common';
import { CreateEmailSettingsDto } from './dto/create-email-setting.dto';
import { UpdateEmailSettingDto } from './dto/update-email-setting.dto';
import { EncryptionService } from 'src/utilities/encryption/encryption.service';
import { EmailSettingsRepository } from 'src/repository/email-settings.repository';
import { EmailSettings } from './entities/email-setting.entity';
import { Transactional } from 'typeorm-transactional';

@Injectable()
export class EmailSettingsService {
  constructor(
    private readonly emailSettingsRepository: EmailSettingsRepository,
    private readonly encryptionService: EncryptionService,
  ) {}

  @Transactional()
  async create(createDto: CreateEmailSettingsDto) {
    // Encrypt the email authentication password
    const encryptedPassword = this.encryptionService.encrypt(
      createDto.emailAuthPassword,
    );
    // If isPrimary is true, unset other primary email settings for the organization
    if (createDto.isPrimary) {
      const currentPrimaryEmailSetting =
        await this.emailSettingsRepository.findPrimaryEmailSettings(
          createDto.organizationId,
        );
      if (currentPrimaryEmailSetting) {
        await this.emailSettingsRepository.updateEmailSettings(
          currentPrimaryEmailSetting.id,
          {
            ...currentPrimaryEmailSetting,
            isPrimary: false,
          },
        );
      }
    }

    const newEmailSetting: Partial<EmailSettings> = {
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
      organizationId: createDto.organizationId,
    };

    await this.emailSettingsRepository.createEmailSettings(newEmailSetting);
    // create shallow copy of the created
    const emailSettings = { ...newEmailSetting };
    delete emailSettings.emailAuthPassword;
    delete emailSettings.organization;
    return emailSettings;
  }

  async findAllByOrganization(organizationId: string) {
    return this.emailSettingsRepository.findEmailSettingsByOrganization(
      organizationId,
    );
  }

  @Transactional()
  async update(id: string, updateDto: UpdateEmailSettingDto) {
    // If updating the password, encrypt it
    if (updateDto.emailAuthPassword) {
      updateDto.emailAuthPassword = this.encryptionService.encrypt(
        updateDto.emailAuthPassword,
      );
      delete updateDto.emailAuthPassword;
    }
    // If isPrimary is true, unset other primary email settings for the organization
    if (updateDto.isPrimary) {
      const currentPrimaryEmailSetting =
        await this.emailSettingsRepository.findPrimaryEmailSettings(
          updateDto.organizationId,
        );
      if (currentPrimaryEmailSetting) {
        await this.update(currentPrimaryEmailSetting.id, {
          ...currentPrimaryEmailSetting,
          isPrimary: false,
        });
      }
    }
    return this.emailSettingsRepository.updateEmailSettings(id, updateDto);
  }

  // async remove(id: string) {
  //   return this.databaseService.emailSettings.delete({
  //     where: { id },
  //   });
  // }

  async getEmailSettings(
    organizationId: string,
    emailSettingId: string = null,
  ): Promise<any> {
    const emailSettings =
      await this.emailSettingsRepository.getEmailSettingsById(
        emailSettingId,
        organizationId,
      );
    // decrypt the SMTP password
    const emailAuthPassword = this.encryptionService.decrypt(
      emailSettings.emailAuthPassword,
    );
    return {
      ...emailSettings,
      emailAuthPassword,
    };
  }

  async getPrimaryEmailSettings(organizationId: string) {
    return this.emailSettingsRepository.findPrimaryEmailSettings(
      organizationId,
    );
  }
}
