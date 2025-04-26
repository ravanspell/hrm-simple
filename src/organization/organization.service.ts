import { Injectable, NotFoundException } from '@nestjs/common';
import { Organization } from './entities/organization.entity';
import { Transactional } from 'typeorm-transactional';
import { OrganizationRepository } from 'src/repository/organization.repository';
import { StorageInfoResponseDto } from './dto/storage-info-response.dto';
import { PaginatedResponseDto } from '@/common/dto/paginated-response.dto';
import { PaginationDto } from '@/common/dto/pagination.dto';

@Injectable()
export class OrganizationService {
  constructor(private organizationRepository: OrganizationRepository) {}

  /**
   * Create a new organization.
   *
   * @param data - The data to create a new organization.
   * @returns The created organization.
   */
  @Transactional()
  async create(data: Partial<Organization>): Promise<Organization> {
    return this.organizationRepository.createOrganization(data);
  }

  /**
   * Get all organizations with pagination.
   *
   * @param pagination - Pagination parameters
   * @returns Paginated list of organizations
   */
  async getAllOrganizations(
    pagination: PaginationDto,
  ): Promise<PaginatedResponseDto<Organization>> {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;
    const [organizations, total] =
      await this.organizationRepository.findOrganizationsWithPagination(
        skip,
        limit,
      );

    return {
      items: organizations,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get an organization by its ID.
   *
   * @param id - The ID of the organization to retrieve.
   * @returns The organization with the specified ID.
   * @throws NotFoundException if organization not found
   */
  async getOrganizationById(id: string): Promise<Organization> {
    const organization = await this.organizationRepository.findOne({
      where: { id },
    });
    if (!organization) {
      throw new NotFoundException(`Organization with ID ${id} not found`);
    }
    return organization;
  }

  /**
   * Update the used storage for an organization.
   *
   * @param id - The ID of the organization.
   * @param bytesToAdd - The number of bytes to add (positive) or subtract (negative) from the used storage.
   * @returns The updated organization.
   * @throws NotFoundException if organization not found
   */
  @Transactional()
  async updateUsedStorage(
    id: string,
    bytesToAdd: number,
  ): Promise<Organization> {
    const organization = await this.getOrganizationById(id);

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

  /**
   * Update an organization
   * @param id - The ID of the organization to update
   * @param data - The data to update
   * @returns The updated organization
   * @throws NotFoundException if organization not found
   */
  async update(id: string, data: Partial<Organization>): Promise<Organization> {
    await this.getOrganizationById(id);
    await this.organizationRepository.update(id, data);
    return this.getOrganizationById(id);
  }

  /**
   * Delete an organization
   * @param id - The ID of the organization to delete
   * @throws NotFoundException if organization not found
   */
  async delete(id: string): Promise<void> {
    await this.getOrganizationById(id);
    await this.organizationRepository.delete(id);
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
