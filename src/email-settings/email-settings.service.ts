import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateEmailSettingsDto } from './dto/create-email-setting.dto';
import { UpdateEmailSettingDto } from './dto/update-email-setting.dto';
import { EncryptionService } from 'src/utilities/encryption/encryption.service';
import { EmailSettingsRepository } from 'src/repository/email-settings.repository';
import { EmailSettings } from './entities/email-setting.entity';
import { Transactional } from 'typeorm-transactional';

/**
 * Service responsible for managing email settings operations
 * Handles creation, retrieval, updating, and deletion of email settings
 * with proper encryption of sensitive data and primary email settings management
 */
@Injectable()
export class EmailSettingsService {
  constructor(
    private readonly emailSettingsRepository: EmailSettingsRepository,
    private readonly encryptionService: EncryptionService,
  ) {}

  /**
   * Creates a new email setting for an organization
   *
   * @param createDto - DTO containing email settings data
   * @returns The created email settings without sensitive data
   *
   * @description
   * - Encrypts the email authentication password for security
   * - If the new setting is marked as primary, it will unset any existing primary setting
   * - Uses transaction to ensure data consistency
   */
  @Transactional()
  async create(createDto: CreateEmailSettingsDto) {
    // Encrypt the email authentication password for security
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

    // Prepare the new email setting with encrypted password
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

    // Create the email setting in the database
    await this.emailSettingsRepository.createEmailSettings(newEmailSetting);

    // Create a shallow copy without sensitive data for the response
    const emailSettings = { ...newEmailSetting };
    delete emailSettings.emailAuthPassword;
    delete emailSettings.organization;
    return emailSettings;
  }

  /**
   * Retrieves all email settings for a specific organization
   *
   * @param organizationId - The ID of the organization
   * @returns Array of email settings for the organization
   */
  async findAllByOrganization(organizationId: string) {
    return this.emailSettingsRepository.findEmailSettingsByOrganization(
      organizationId,
    );
  }

  /**
   * Updates an existing email setting
   *
   * @param id - The ID of the email setting to update
   * @param updateDto - DTO containing the updated email settings data
   * @returns The updated email settings
   *
   * @description
   * - If password is being updated, it will be encrypted
   * - If setting is being marked as primary, it will unset any existing primary setting
   * - Uses transaction to ensure data consistency
   */
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

  /**
   * Retrieves email settings by ID and organization
   *
   * @param organizationId - The ID of the organization
   * @param emailSettingId - Optional ID of the specific email setting
   * @returns Email settings with decrypted password
   *
   * @description
   * - Decrypts the email authentication password for display/use
   */
  async getEmailSettings(
    organizationId: string,
    emailSettingId: string = null,
  ): Promise<any> {
    const emailSettings =
      await this.emailSettingsRepository.getEmailSettingsById(
        emailSettingId,
        organizationId,
      );

    // Decrypt the SMTP password for use
    const emailAuthPassword = this.encryptionService.decrypt(
      emailSettings.emailAuthPassword,
    );

    return {
      ...emailSettings,
      emailAuthPassword,
    };
  }

  /**
   * Retrieves the primary email settings for an organization
   *
   * @param organizationId - The ID of the organization
   * @returns The primary email settings for the organization
   */
  async getPrimaryEmailSettings(organizationId: string) {
    return this.emailSettingsRepository.findPrimaryEmailSettings(
      organizationId,
    );
  }

  /**
   * Deletes an email setting by ID
   *
   * @param id - The ID of the email setting to delete
   * @returns The result of the deletion operation
   *
   * @throws BadRequestException - If email settings not found or if trying to delete primary settings
   *
   * @description
   * - Prevents deletion of primary email settings
   * - Verifies the email setting exists before attempting deletion
   */
  async remove(id: string) {
    // Check if the email setting exists
    const emailSetting =
      await this.emailSettingsRepository.getEmailSettingsById(id);

    if (!emailSetting) {
      throw new BadRequestException('Email settings not found');
    }

    // Prevent deletion of primary email settings
    if (emailSetting.isPrimary) {
      throw new BadRequestException('Cannot delete primary email settings');
    }

    // Delete the email setting
    return this.emailSettingsRepository.deleteEmailSettings(id);
  }
}
