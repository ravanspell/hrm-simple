import { Injectable } from '@nestjs/common';
import { Organization } from './entities/organization.entity';
import { Transactional } from 'typeorm-transactional';
import { OrganizationRepository } from 'src/repository/organization.repository';
import { StorageInfoResponseDto } from './dto/storage-info-response.dto';

@Injectable()
export class OrganizationService {
  constructor(private organizationRepository: OrganizationRepository) {}

  @Transactional()
  async create(data: Partial<Organization>) {
    const org = await this.organizationRepository.createOrganization(data);
    // throw new Error('This is a test error');
    return org;
  }

  async getAllOrganizations(page: number = 1, limit: number = 10) {
    return this.organizationRepository.getOrganizations(page, limit);
  }

  /**
   * Get an organization by its ID.
   * @param id - The ID of the organization to retrieve.
   * @returns The organization with the specified ID.
   */
  async getOrganizationById(id: string): Promise<Organization> {
    return this.organizationRepository.findOne({ where: { id } });
  }

  /**
   * Update the used storage for an organization.
   * @param id - The ID of the organization.
   * @param bytesToAdd - The number of bytes to add (positive) or subtract (negative) from the used storage.
   * @returns The updated organization.
   */
  @Transactional()
  async updateUsedStorage(
    id: string,
    bytesToAdd: number,
  ): Promise<Organization> {
    const organization = await this.getOrganizationById(id);
    if (!organization) {
      throw new Error(`Organization with ID ${id} not found`);
    }

    // Ensure we're working with numbers, not strings
    const currentUsedStorage = Number(organization.usedStorage) || 0;
    const bytesToAddNum = Number(bytesToAdd);

    // Calculate new used storage value
    const newUsedStorage = Math.max(0, currentUsedStorage + bytesToAddNum);

    // Update the organization
    await this.organizationRepository.update(id, {
      usedStorage: newUsedStorage,
    });

    // Return the updated organization
    return this.getOrganizationById(id);
  }

  update(id: number, data: Partial<Organization>) {
    return this.organizationRepository.update(id, data);
  }

  delete(id: number) {
    return this.organizationRepository.delete(id);
  }

  /**
   * Get storage information for an organization.
   * @param id - The ID of the organization.
   * @returns Storage information including allocated, used, and percentage.
   */
  async getStorageInfo(id: string): Promise<StorageInfoResponseDto> {
    const organization = await this.getOrganizationById(id);
    if (!organization) {
      throw new Error(`Organization with ID ${id} not found`);
    }

    const allocatedStorage = organization.storage || 0;
    const usedStorage = organization.usedStorage || 0;

    // Calculate usage percentage (avoid division by zero)
    let usagePercentage = 0;

    if (allocatedStorage > 0) {
      usagePercentage = Math.ceil((usedStorage / allocatedStorage) * 100);
    }

    // Format storage values for human readability
    const allocatedStorageFormatted = this.formatBytes(allocatedStorage);
    const usedStorageFormatted = this.formatBytes(usedStorage);

    return {
      allocatedStorage,
      usedStorage,
      usagePercentage,
      allocatedStorageFormatted,
      usedStorageFormatted,
    };
  }

  /**
   * Format bytes to human-readable string (KB, MB, GB, TB)
   * @param bytes - Number of bytes
   * @returns Formatted string (e.g., "1.5 GB")
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
