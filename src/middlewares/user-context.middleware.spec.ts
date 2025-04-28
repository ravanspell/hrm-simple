import { Test, TestingModule } from '@nestjs/testing';
import { UserContextMiddleware } from './user-context.middleware';
import { AsyncStorageService } from '@/utilities/async-storage-service/async-storage.service';
import { USER_CONTEXT_KEY } from '@/constants/common';
import { User } from '@/user/entities/user.entity';

describe('User context middleware test cases - set user in async storage', () => {
  let middleware: UserContextMiddleware;
  let asyncStorageService: AsyncStorageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserContextMiddleware,
        {
          provide: AsyncStorageService,
          useValue: {
            set: jest.fn(),
          },
        },
      ],
    }).compile();

    middleware = module.get<UserContextMiddleware>(UserContextMiddleware);
    asyncStorageService = module.get<AsyncStorageService>(AsyncStorageService);
  });

  it('should be defined', () => {
    expect(middleware).toBeDefined();
  });

  it('should set user in async storage when user exists', () => {
    const mockUser: User = {
      id: 'test-user-id',
      email: 'test@example.com',
      // Add other required User properties
    } as User;

    const mockReq = {
      user: mockUser,
    };
    const mockRes = {};
    const mockNext = jest.fn();

    middleware.use(mockReq, mockRes, mockNext);

    expect(asyncStorageService.set).toHaveBeenCalledWith(
      USER_CONTEXT_KEY,
      mockUser,
    );
    expect(mockNext).toHaveBeenCalled();
  });

  it('should not set user in async storage when user does not exist', () => {
    const mockReq = {};
    const mockRes = {};
    const mockNext = jest.fn();

    middleware.use(mockReq, mockRes, mockNext);

    expect(asyncStorageService.set).not.toHaveBeenCalled();
    expect(mockNext).toHaveBeenCalled();
  });
});
