import { TenantId } from './tenant.decorator';
import { TenantContext } from '../tenant/tenant-context';
import { BadRequestException } from '@nestjs/common';

describe('TenantId Decorator', () => {
  beforeEach(() => {
    // Clear the tenant context before each test
    jest.clearAllMocks();
  });

  it('should return the current tenant ID', () => {
    // Set the tenant ID
    TenantContext.setCurrentTenantId('test-org-123');

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
  });

  it('should throw a BadRequestException when tenant ID is not set', () => {
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
