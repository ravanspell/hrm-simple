import { Injectable } from '@nestjs/common';
import { GeneralSettingsDto } from './dto/general-settings.dto';
import { GeneralSettings } from './entities/general-settings.entity';
import { GeneralSettingsRepository } from '@/repository/general-settings.repository';

@Injectable()
export class GeneralSettingsService {
  constructor(
    private readonly generalSettingsRepository: GeneralSettingsRepository,
  ) {}

  /**
   * Retrieves general settings for an organization.
   *
   * @param organizationId - The unique ID of the organization.
   * @returns The GeneralSettings entity.
   */
  async getGeneralSettings(organizationId: string): Promise<GeneralSettings> {
    const settings =
      await this.generalSettingsRepository.getGeneralSettingsByOrganizationId(
        organizationId,
      );
    if (!settings) {
      throw new Error(
        `General settings for organization ${organizationId} not found.`,
      );
    }
    return settings;
  }

  /**
   * Creates general settings for an organization.
   *
   * @param organizationId - The unique ID of the organization.
   * @param generalSettingsDto - The data to create general settings.
   * @returns The created GeneralSettings entity.
   */
  async createGeneralSettings(
    organizationId: string,
    generalSettingsDto: GeneralSettingsDto,
  ): Promise<GeneralSettings> {
    return this.generalSettingsRepository.createGeneralSettings(
      organizationId,
      generalSettingsDto,
    );
  }

  /**
   * Updates general settings for an organization.
   *
   * @param organizationId - The unique ID of the organization.
   * @param generalSettingsDto - The data to update general settings.
   * @returns The updated GeneralSettings entity.
   */
  async updateGeneralSettings(
    organizationId: string,
    generalSettingsDto: GeneralSettingsDto,
  ): Promise<GeneralSettings> {
    await this.generalSettingsRepository.updateGeneralSettings(
      organizationId,
      generalSettingsDto,
    );
    return this.getGeneralSettings(organizationId);
  }
}
