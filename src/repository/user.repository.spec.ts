import { UserRepository } from './user.repository';
import { DataSource, EntityManager } from 'typeorm';
import { User } from '@/user/entities/user.entity';
import 'reflect-metadata';

jest.mock('typeorm', () => ({
  DataSource: jest.fn().mockImplementation(() => ({
    createEntityManager: jest.fn(),
    getMetadata: jest.fn().mockReturnValue({
      columns: [],
      relations: [],
    }),
  })),
}));

describe('UserRepository', () => {
  let userRepository: UserRepository;
  let dataSourceMock: Partial<DataSource>;
  let entityManagerMock: Partial<EntityManager>;

  beforeEach(() => {
    entityManagerMock = {
      findOne: jest.fn(),
    };

    // dataSourceMock = {
    //   createEntityManager: jest.fn().mockReturnValue(entityManagerMock),
    //   getMetadata: jest.fn().mockReturnValue({
    //     columns: [],
    //     relations: [],
    //   }),
    // } as Partial<DataSource>;

    userRepository = new UserRepository(dataSourceMock as DataSource);
  });

  it('should find a user by email', async () => {
    const email = 'test@example.com';
    const user = new User();
    user.email = email;
    // (entityManagerMock.findOne as jest.Mock).mockResolvedValue(user);
    const result = await userRepository.findUser(email);

    expect(result).toEqual(user);
    // expect(entityManagerMock.findOne).toHaveBeenCalledWith({
    //   where: { email },
    //   relations: ['organization'],
    // });
  });
});
