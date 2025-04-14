import { Test, TestingModule } from '@nestjs/testing';
import { FileMgtUtilityService } from './file-mgt-utility.service';

describe('FileMgtUtilityService', () => {
  let service: FileMgtUtilityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FileMgtUtilityService],
    }).compile();

    service = module.get<FileMgtUtilityService>(FileMgtUtilityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('formatBytes', () => {
    it('should return "0 Bytes" for 0 bytes', () => {
      expect(service.formatBytes(0)).toBe('0 Bytes');
    });

    it('should format bytes correctly', () => {
      expect(service.formatBytes(500)).toBe('500 Bytes');
    });

    it('should format kilobytes correctly', () => {
      expect(service.formatBytes(1024)).toBe('1 KB');
      expect(service.formatBytes(2048)).toBe('2 KB');
      expect(service.formatBytes(1536)).toBe('1.5 KB');
    });

    it('should format megabytes correctly', () => {
      expect(service.formatBytes(1024 * 1024)).toBe('1 MB');
      expect(service.formatBytes(2.5 * 1024 * 1024)).toBe('2.5 MB');
      expect(service.formatBytes(10.75 * 1024 * 1024)).toBe('10.75 MB');
    });

    it('should format gigabytes correctly', () => {
      expect(service.formatBytes(1024 * 1024 * 1024)).toBe('1 GB');
      expect(service.formatBytes(2.5 * 1024 * 1024 * 1024)).toBe('2.5 GB');
      expect(service.formatBytes(10.75 * 1024 * 1024 * 1024)).toBe('10.75 GB');
    });

    it('should format terabytes correctly', () => {
      expect(service.formatBytes(1024 * 1024 * 1024 * 1024)).toBe('1 TB');
      expect(service.formatBytes(2.5 * 1024 * 1024 * 1024 * 1024)).toBe(
        '2.5 TB',
      );
      expect(service.formatBytes(10.75 * 1024 * 1024 * 1024 * 1024)).toBe(
        '10.75 TB',
      );
    });

    it('should handle large numbers correctly', () => {
      expect(service.formatBytes(Number.MAX_SAFE_INTEGER)).toBe('8 PB');
    });

    it('should handle decimal values correctly', () => {
      expect(service.formatBytes(1024.5)).toBe('1 KB');
      expect(service.formatBytes(1024 * 1024 * 1.5)).toBe('1.5 MB');
    });
  });
});
