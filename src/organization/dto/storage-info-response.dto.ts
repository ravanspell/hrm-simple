export class StorageInfoResponseDto {
  /**
   * Total allocated storage in bytes
   */
  allocatedStorage: number;

  /**
   * Total used storage in bytes
   */
  usedStorage: number;

  /**
   * Percentage of allocated storage that is used (0-100)
   */
  usagePercentage: number;

  /**
   * Human-readable representation of allocated storage (e.g., "10 GB")
   */
  allocatedStorageFormatted: string;

  /**
   * Human-readable representation of used storage (e.g., "5.2 GB")
   */
  usedStorageFormatted: string;
}
