import { TenantContext } from '@/tenant/tenant-context';
import { TenantMiddleware } from './tenant.middleware';
import { Request, Response } from 'express';

describe('Tenant middleware test suite', () => {
  let middleware: TenantMiddleware;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.Mock;
  let mockTenantContext: jest.Mocked<TenantContext>;

  beforeEach(() => {
    // Create a mock TenantContext
    mockTenantContext = {
      setCurrentTenantId: jest.fn(),
      getCurrentTenantId: jest.fn(),
      runWithTenant: jest.fn(),
    } as unknown as jest.Mocked<TenantContext>;

    middleware = new TenantMiddleware(mockTenantContext);
    mockRequest = {};
    mockResponse = {};
    nextFunction = jest.fn();
  });

  it('should set the tenant ID in the context when user has organizationId', () => {
    // Set up the request with a user that has an organizationId
    mockRequest.user = { organizationId: 'test-org-123' };

    // Call the middleware
    middleware.use(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction,
    );

    // Verify that setCurrentTenantId was called with the correct organizationId
    expect(mockTenantContext.setCurrentTenantId).toHaveBeenCalledWith(
      'test-org-123',
    );

    // Verify that the next function was called
    expect(nextFunction).toHaveBeenCalled();
  });

  it('should call next directly when user does not have organizationId', () => {
    // Set up the request with a user that does not have an organizationId
    mockRequest.user = {};

    // Call the middleware
    middleware.use(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction,
    );

    // Verify that setCurrentTenantId was not called
    expect(mockTenantContext.setCurrentTenantId).not.toHaveBeenCalled();

    // Verify that the next function was called
    expect(nextFunction).toHaveBeenCalled();
  });

  it('should call next directly when there is no user', () => {
    // Set up the request with no user
    mockRequest.user = undefined;

    // Call the middleware
    middleware.use(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction,
    );

    // Verify that setCurrentTenantId was not called
    expect(mockTenantContext.setCurrentTenantId).not.toHaveBeenCalled();

    // Verify that the next function was called
    expect(nextFunction).toHaveBeenCalled();
  });
});
