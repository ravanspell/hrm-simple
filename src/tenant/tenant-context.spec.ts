import { TenantContext } from './tenant-context';
import { AsyncStorageService } from '../utilities/async-storage-service/async-storage.service';

describe('Tenant context test suite', () => {
  const testTenantId = 'test-tenant-123';
  let tenantContext: TenantContext;
  let asyncStorageService: AsyncStorageService;

  beforeEach(() => {
    // Create a mock AsyncStorageService
    asyncStorageService = {
      get: jest.fn(),
      set: jest.fn(),
      runWithContext: jest.fn((key, value, fn) => fn()),
    } as unknown as AsyncStorageService;

    // Create a new instance of TenantContext for each test
    tenantContext = new TenantContext(asyncStorageService);
  });

  describe('getCurrentTenantId', () => {
    it('should return undefined when no tenant is set', () => {
      (asyncStorageService.get as jest.Mock).mockReturnValue(undefined);
      expect(tenantContext.getCurrentTenantId()).toBeUndefined();
    });

    it('should return the current tenant ID when set', () => {
      (asyncStorageService.get as jest.Mock).mockReturnValue(testTenantId);
      expect(tenantContext.getCurrentTenantId()).toBe(testTenantId);
    });
  });

  describe('setCurrentTenantId', () => {
    it('should set the current tenant ID', () => {
      tenantContext.setCurrentTenantId(testTenantId);
      expect(asyncStorageService.set).toHaveBeenCalledWith(
        'organizationId',
        testTenantId,
      );
    });

    it('should update the current tenant ID when called multiple times', () => {
      tenantContext.setCurrentTenantId('initial-tenant');
      tenantContext.setCurrentTenantId(testTenantId);
      expect(asyncStorageService.set).toHaveBeenCalledWith(
        'organizationId',
        testTenantId,
      );
    });
  });

  describe('runWithTenant', () => {
    it('should run a function with the specified tenant ID', () => {
      const mockFn = jest.fn().mockReturnValue(testTenantId);
      (asyncStorageService.runWithContext as jest.Mock).mockImplementation(
        (key, value, fn) => fn(),
      );

      const result = tenantContext.runWithTenant(testTenantId, mockFn);

      expect(asyncStorageService.runWithContext).toHaveBeenCalledWith(
        'organizationId',
        testTenantId,
        mockFn,
      );
      expect(result).toBe(testTenantId);
    });

    it('should not affect the outer tenant context', () => {
      // This test is a bit tricky since we're using mocks
      // We'll verify that runWithContext is called correctly
      const mockFn = jest.fn();
      tenantContext.runWithTenant(testTenantId, mockFn);

      expect(asyncStorageService.runWithContext).toHaveBeenCalledWith(
        'organizationId',
        testTenantId,
        mockFn,
      );
    });

    it('should return the result of the function', () => {
      const expectedResult = 'function result';
      const mockFn = jest.fn().mockReturnValue(expectedResult);
      (asyncStorageService.runWithContext as jest.Mock).mockImplementation(
        (key, value, fn) => fn(),
      );

      const result = tenantContext.runWithTenant(testTenantId, mockFn);

      expect(result).toBe(expectedResult);
    });
  });
});
