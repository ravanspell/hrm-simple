import { UserRepository } from './user.repository';
import { DataSource, EntityManager } from 'typeorm';
import { User } from 'src/user/entities/user.entity';

describe('UserRepository', () => {
    let userRepository: UserRepository;
    let dataSourceMock: Partial<DataSource>;
    let entityManagerMock: Partial<EntityManager>;

    beforeEach(() => {
        entityManagerMock = {
            findOne: jest.fn(),
        };
        dataSourceMock = {
            createEntityManager: jest.fn().mockReturnValue(entityManagerMock),
        };
        userRepository = new UserRepository(dataSourceMock as DataSource);
    });

    it('should find a user by email', async () => {
        const email = 'test@example.com';
        const user = new User();
        user.email = email;
        (entityManagerMock.findOne as jest.Mock).mockResolvedValue(user);

        const result = await userRepository.findUser(email);

        expect(result).toEqual(user);
        expect(entityManagerMock.findOne).toHaveBeenCalledWith({
            where: { email },
            relations: ['organization'],
        });
    });
});