import { TenantId } from './tenant.decorator';
import { BadRequestException } from '@nestjs/common';
import { TenantService } from '../utilities/tenant-service/tenant.service';

// Mock the TenantService
jest.mock('../utilities/tenant-service/tenant.service');

describe('TenantId Decorator', () => {
  beforeEach(() => {
    // Clear the tenant context before each test
    jest.clearAllMocks();
  });

  it('should return the current tenant ID', () => {
    // Set the tenant ID
    (TenantService.getCurrentTenantId as jest.Mock).mockReturnValue(
      'test-org-123',
    );

    // Create a mock execution context
    const mockExecutionContext = {
      switchToHttp: () => ({
        getRequest: () => ({}),
      }),
    };

    // Call the decorator
    const result = TenantId(null, mockExecutionContext as any);

    // Verify the result
    expect(result).toBe('test-org-123');
    expect(TenantService.getCurrentTenantId).toHaveBeenCalled();
  });

  it('should throw a BadRequestException when tenant ID is not set', () => {
    // Mock the tenant ID to return undefined
    (TenantService.getCurrentTenantId as jest.Mock).mockReturnValue(undefined);

    // Create a mock execution context
    const mockExecutionContext = {
      switchToHttp: () => ({
        getRequest: () => ({}),
      }),
    };

    // Call the decorator and expect it to throw
    expect(() => {
      TenantId(null, mockExecutionContext as any);
    }).toThrow(BadRequestException);
  });
});
