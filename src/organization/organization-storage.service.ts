import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { StorageInfoResponseDto } from './dto/storage-info-response.dto';
import { FileMgtUtilityService } from '../utilities/file-mgt-utility/file-mgt-utility.service';
import { OrganizationRepository } from 'src/repository/organization.repository';

@Injectable()
export class OrganizationStorageService {
  constructor(
    private organizationRepository: OrganizationRepository,
    private fileMgtUtilityService: FileMgtUtilityService,
  ) {}

  /**
   * Increase the used storage for an organization.
   * @param transactionalEntityManager - Optional transaction manager for database operations.
   * @param orgId - The ID of the organization.
   * @param bytesAdded - The number of bytes to add to the used storage.
   */
  async increaseStorageUsed(
    transactionalEntityManager: EntityManager | null,
    orgId: string,
    bytesAdded: number,
  ): Promise<void> {
    const organization = await this.organizationRepository.findOneBy({
      id: orgId,
    });
    if (!organization) {
      throw new Error(`Organization with ID ${orgId} not found`);
    }

    const currentUsedStorage = Number(organization.usedStorage) || 0;
    const newUsedStorage = currentUsedStorage + bytesAdded;

    await this.organizationRepository.update(
      { id: orgId },
      { usedStorage: newUsedStorage },
    );
  }

  /**
   * Decrease the used storage for an organization.
   * @param transactionalEntityManager - Optional transaction manager for database operations.
   * @param orgId - The ID of the organization.
   * @param bytesRemoved - The number of bytes to remove from the used storage.
   */
  async decreaseStorageUsed(
    transactionalEntityManager: EntityManager | null,
    orgId: string,
    bytesRemoved: number,
  ): Promise<void> {
    const organization = await this.organizationRepository.findOneBy({
      id: orgId,
    });
    if (!organization) {
      throw new Error(`Organization with ID ${orgId} not found`);
    }

    const currentUsedStorage = Number(organization.usedStorage) || 0;
    const newUsedStorage = Math.max(0, currentUsedStorage - bytesRemoved);

    await this.organizationRepository.update(
      { id: orgId },
      { usedStorage: newUsedStorage },
    );
  }

  /**
   * Check if an organization has available storage for the given bytes.
   * @param orgId - The ID of the organization.
   * @param bytesNeeded - The number of bytes needed.
   * @returns True if the organization has enough storage, false otherwise.
   */
  async hasAvailableStorage(
    orgId: string,
    bytesNeeded: number,
  ): Promise<boolean> {
    const organization = await this.organizationRepository.findOneBy({
      id: orgId,
    });
    if (!organization) {
      throw new Error(`Organization with ID ${orgId} not found`);
    }

    const allocatedStorage = Number(organization.storage) || 0;
    const usedStorage = Number(organization.usedStorage) || 0;
    const availableStorage = allocatedStorage - usedStorage;

    return availableStorage >= bytesNeeded;
  }

  /**
   * Get the remaining storage for an organization.
   * @param orgId - The ID of the organization.
   * @returns The remaining storage in bytes.
   */
  async getRemainingStorage(orgId: string): Promise<number> {
    const organization = await this.organizationRepository.findOneBy({
      id: orgId,
    });
    if (!organization) {
      throw new Error(`Organization with ID ${orgId} not found`);
    }

    const allocatedStorage = Number(organization.storage) || 0;
    const usedStorage = Number(organization.usedStorage) || 0;

    return Math.max(0, allocatedStorage - usedStorage);
  }

  /**
   * Get storage information for an organization.
   * @param id - The ID of the organization.
   * @returns Storage information including allocated, used, and percentage.
   */
  async getStorageInfo(id: string): Promise<StorageInfoResponseDto> {
    const organization = await this.organizationRepository.findOneBy({ id });
    if (!organization) {
      throw new Error(`Organization with ID ${id} not found`);
    }

    const allocatedStorage = Number(organization.storage) || 0;
    const usedStorage = Number(organization.usedStorage) || 0;

    // Calculate usage percentage (avoid division by zero)
    let usagePercentage = 0;

    if (allocatedStorage > 0) {
      usagePercentage = Math.ceil((usedStorage / allocatedStorage) * 100);
    }

    // Format storage values for human readability
    const allocatedStorageFormatted =
      this.fileMgtUtilityService.formatBytes(allocatedStorage);
    const usedStorageFormatted =
      this.fileMgtUtilityService.formatBytes(usedStorage);

    return {
      allocatedStorage,
      usedStorage,
      usagePercentage,
      allocatedStorageFormatted,
      usedStorageFormatted,
    };
  }
}
