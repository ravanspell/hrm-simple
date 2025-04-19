import { Injectable } from '@nestjs/common';
import { AsyncStorageService } from '../utilities/async-storage-service/async-storage.service';

/**
 * Tenant-specific context utility that uses AsyncStorageService
 * Provides methods specifically for managing tenant (organization) context
 */
@Injectable()
export class TenantContext {
  private static readonly TENANT_KEY = 'organizationId';

  constructor(private readonly asyncStorageService: AsyncStorageService) {}

  /**
   * Get the current tenant ID
   * @returns The current tenant ID or undefined if no tenant is set
   */
  getCurrentTenantId(): string | undefined {
    return this.asyncStorageService.get<string>(TenantContext.TENANT_KEY);
  }

  /**
   * Set the current tenant ID
   * @param organizationId The ID of the organization to set as the current tenant
   */
  setCurrentTenantId(organizationId: string): void {
    this.asyncStorageService.set(TenantContext.TENANT_KEY, organizationId);
  }

  /**
   * Run a function with a specific tenant ID
   * @param organizationId The ID of the organization to set as the current tenant
   * @param fn The function to run with the specific tenant ID
   * @returns The result of the function
   */
  runWithTenant<T>(organizationId: string, fn: () => T): T {
    return this.asyncStorageService.runWithContext<string, T>(
      TenantContext.TENANT_KEY,
      organizationId,
      fn,
    );
  }
}
