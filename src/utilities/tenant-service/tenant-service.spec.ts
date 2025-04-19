import { AsyncStorageService } from '../async-storage-service/async-storage.service';
import { TenantService } from './tenant.service';

describe('Tenant service test suite', () => {
  const testTenantId = 'test-tenant-123';
  let tenantService: TenantService;
  let asyncStorageService: AsyncStorageService;

  beforeEach(() => {
    // Create a mock AsyncStorageService
    asyncStorageService = {
      get: jest.fn(),
      set: jest.fn(),
    } as unknown as AsyncStorageService;

    // Create a new instance of TenantService for each test
    tenantService = new TenantService(asyncStorageService);
  });

  describe('getCurrentTenantId', () => {
    it('should return undefined when no tenant is set', () => {
      (asyncStorageService.get as jest.Mock).mockReturnValue(undefined);
      expect(tenantService.getCurrentTenantId()).toBeUndefined();
    });

    it('should return the current tenant ID when set', () => {
      (asyncStorageService.get as jest.Mock).mockReturnValue(testTenantId);
      expect(tenantService.getCurrentTenantId()).toBe(testTenantId);
    });
  });

  describe('setCurrentTenantId', () => {
    it('should set the current tenant ID', () => {
      tenantService.setCurrentTenantId(testTenantId);
      expect(asyncStorageService.set).toHaveBeenCalledWith(
        'organizationId',
        testTenantId,
      );
    });

    it('should update the current tenant ID when called multiple times', () => {
      tenantService.setCurrentTenantId('initial-tenant');
      tenantService.setCurrentTenantId(testTenantId);
      expect(asyncStorageService.set).toHaveBeenCalledWith(
        'organizationId',
        testTenantId,
      );
    });
  });

  describe('static getCurrentTenantId', () => {
    it('should return undefined when no tenant is set', () => {
      (asyncStorageService.get as jest.Mock).mockReturnValue(undefined);
      expect(TenantService.getCurrentTenantId()).toBeUndefined();
    });

    it('should return the current tenant ID when set', () => {
      (asyncStorageService.get as jest.Mock).mockReturnValue(testTenantId);
      expect(TenantService.getCurrentTenantId()).toBe(testTenantId);
    });
  });
});
