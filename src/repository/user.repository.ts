import { User } from 'src/user/entities/user.entity';
import { Repository, DataSource } from 'typeorm';

export const USER_REPOSITORY = 'UserRepository';

export class UserRepository extends Repository<User> {
    constructor(dataSource: DataSource) {
        super(User, dataSource.createEntityManager());
    }

    findUser(email: string): Promise<User> {
        return this.findOne({ where: { email }, relations: ['organization'] });
    }
}

export const UserRepositoryProvider = {
    provide: USER_REPOSITORY,
    useFactory: (dataSource: DataSource) => new UserRepository(dataSource),
    inject: [DataSource],
};