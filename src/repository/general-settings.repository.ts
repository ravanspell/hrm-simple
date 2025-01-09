import { GeneralSettingsDto } from '@/organization/dto/general-settings.dto';
import { GeneralSettings } from '@/organization/entities/general-settings.entity';
import { Injectable } from '@nestjs/common';
import { DataSource, Repository, UpdateResult } from 'typeorm';

/**
 * Repository for managing general settings related database operations.
 */
@Injectable()
export class GeneralSettingsRepository extends Repository<GeneralSettings> {
  constructor(dataSource: DataSource) {
    super(GeneralSettings, dataSource.createEntityManager());
  }

  /**
   * Creates a new GeneralSettings record for an organization.
   *
   * @param organizationId - The unique ID of the organization.
   * @param generalSettingsDto - The data to create general settings.
   * @returns The created GeneralSettings entity.
   */
  async createGeneralSettings(
    organizationId: string,
    generalSettingsDto: GeneralSettingsDto,
  ): Promise<GeneralSettings> {
    const newSettings = this.create({
      organization_id: organizationId,
      ...generalSettingsDto,
    });
    return this.save(newSettings);
  }

  /**
   * Updates an existing GeneralSettings record.
   *
   * @param organizationId - The unique ID of the organization.
   * @param generalSettingsDto - The data to update general settings.
   * @returns The result of the update operation.
   */
  async updateGeneralSettings(
    organizationId: string,
    generalSettingsDto: GeneralSettingsDto,
  ): Promise<UpdateResult> {
    return this.update({ organization_id: organizationId }, generalSettingsDto);
  }

  /**
   * Finds general settings by organization ID.
   *
   * @param organizationId - The unique ID of the organization.
   * @returns The GeneralSettings entity.
   */
  async getGeneralSettingsByOrganizationId(
    organizationId: string,
  ): Promise<GeneralSettings> {
    return this.findOne({ where: { organization_id: organizationId } });
  }
}
