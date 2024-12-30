/**
 * UserRepository is a custom repository for the User entity.
 * It extends the TypeORM Repository class and provides additional
 * methods for querying the User entity.
 */
import { User } from 'src/user/entities/user.entity';
import { Repository, DataSource } from 'typeorm';

export const USER_REPOSITORY = 'UserRepository';

export class UserRepository extends Repository<User> {
    constructor(dataSource: DataSource) {
        super(User, dataSource.createEntityManager());
    }
    /**
     * Finds a user by their email address.
     * @param email - The email address of the user to find.
     * @returns A promise that resolves to the found User entity.
     */
    findUser(email: string): Promise<User> {
        return this.findOne({ where: { email }, relations: ['organization'] });
    }
}

/**
 * UserRepositoryProvider is a provider for the UserRepository.
 * It uses a factory function to create an instance of UserRepository
 * and injects the DataSource dependency.
 */
export const UserRepositoryProvider = {
    provide: USER_REPOSITORY,
    useFactory: (dataSource: DataSource) => new UserRepository(dataSource),
    inject: [DataSource],
};