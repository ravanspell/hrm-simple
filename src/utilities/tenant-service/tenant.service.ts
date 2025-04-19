import { Injectable } from '@nestjs/common';
import { AsyncStorageService } from '../async-storage-service/async-storage.service';

/**
 * Service for managing tenant (organization) context
 * Provides methods for setting and getting the current tenant ID
 *
 * this service use async-storage-service to store the tenant ID in the request context
 */
@Injectable()
export class TenantService {
  private static readonly TENANT_KEY = 'organizationId';
  private static asyncStorageService: AsyncStorageService;

  constructor(private readonly asyncStorageService: AsyncStorageService) {
    TenantService.asyncStorageService = asyncStorageService;
  }

  /**
   * Static method to get the current tenant ID
   * @returns The current tenant ID or undefined if no tenant is set
   */
  static getCurrentTenantId(): string | undefined {
    return this.asyncStorageService?.get<string>(TenantService.TENANT_KEY);
  }

  /**
   * Get the current tenant ID
   * @returns The current tenant ID or undefined if no tenant is set
   */
  getCurrentTenantId(): string | undefined {
    return this.asyncStorageService.get<string>(TenantService.TENANT_KEY);
  }

  /**
   * Set the current tenant ID
   * @param organizationId The ID of the organization to set as the current tenant
   */
  setCurrentTenantId(organizationId: string): void {
    this.asyncStorageService.set(TenantService.TENANT_KEY, organizationId);
  }
}
