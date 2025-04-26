/**
 * UserRepository is a custom repository for the User entity.
 * It extends the TypeORM Repository class and provides additional
 * methods for querying the User entity.
 */
import { Injectable } from '@nestjs/common';
import { User } from 'src/user/entities/user.entity';
import { Repository, DataSource } from 'typeorm';

@Injectable()
export class UserRepository extends Repository<User> {
  constructor(dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }

  /**
   * Saves a User entity.
   * Handles both create and update operations based on the entity state.
   * @param user - The User entity to save.
   * @returns The saved User entity.
   */
  async saveUser(user: User): Promise<User> {
    return this.save(user);
  }

  /**
   * Finds a user by their email address.
   * @param email - The email address of the user to find.
   * @returns A promise that resolves to the found User entity.
   */
  findUserByEmail(email: string): Promise<User> {
    return this.findOne({ where: { email } });
  }
}
