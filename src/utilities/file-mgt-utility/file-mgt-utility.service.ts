import { Injectable } from '@nestjs/common';

@Injectable()
export class FileMgtUtilityService {
  /**
   * Format bytes to human-readable string (KB, MB, GB, TB, PB)
   * @param bytes - Number of bytes
   * @returns Formatted string (e.g., "1.5 GB")
   */
  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }
}
