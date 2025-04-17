import { CurrentUser } from './current-user.decorator';

describe('CurrentUser', () => {
  let mockRequest: any;
  let mockExecutionContext: any;

  beforeEach(() => {
    // Setup mock request with user data
    mockRequest = {
      user: {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        organizationId: 'org-123',
      },
    };

    // Setup mock execution context
    mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnThis(),
      getRequest: jest.fn().mockReturnValue(mockRequest),
    };
  });

  it('should return the entire user object when no data is provided', () => {
    // Create the decorator
    const decorator = CurrentUser();

    // Call the decorator with the mock execution context
    const result = decorator(null, mockExecutionContext, 0);

    // Verify the result
    expect(result).toEqual(mockRequest.user);
    expect(mockExecutionContext.switchToHttp).toHaveBeenCalled();
    expect(mockExecutionContext.getRequest).toHaveBeenCalled();
  });

  it('should return a specific property of the user when data is provided', () => {
    // Create the decorator with a property name
    const decorator = CurrentUser('email');

    // Call the decorator with the mock execution context
    const result = decorator(null, mockExecutionContext, 0);

    // Verify the result
    expect(result).toBe('test@example.com');
    expect(mockExecutionContext.switchToHttp).toHaveBeenCalled();
    expect(mockExecutionContext.getRequest).toHaveBeenCalled();
  });

  it('should return undefined when the requested property does not exist', () => {
    // Create the decorator with a non-existent property
    const decorator = CurrentUser('nonexistent');

    // Call the decorator with the mock execution context
    const result = decorator(null, mockExecutionContext, 0);

    // Verify the result
    expect(result).toBeUndefined();
  });

  it('should return undefined when user is not present in the request', () => {
    // Set user to undefined
    mockRequest.user = undefined;

    // Create the decorator
    const decorator = CurrentUser();

    // Call the decorator with the mock execution context
    const result = decorator(null, mockExecutionContext, 0);

    // Verify the result
    expect(result).toBeUndefined();
  });
});
