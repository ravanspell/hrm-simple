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
  findUser(email: string): Promise<User> {
    return this.findOne({ where: { email } });
  }

  /**
   * Finds a user with their assigned scopes.
   *
   * This method retrieves a user from the database along with:
   * - Role-based scopes (inherited through the user's assigned roles).
   * - Custom scopes (directly assigned to the user).
   *
   * The result includes all necessary relations to assemble the complete list
   * of scopes associated with the user.
   *
   * @param userId - The unique identifier of the user to retrieve.
   * @returns A promise that resolves to the User entity with:
   *   - `roles`: The user's assigned roles, including their associated scopes.
   *   - `scopes`: The custom scopes directly assigned to the user.
   *
   * @example
   * ```typescript
   * const user = await this.userRepository.findUserWithScopes('user123');
   * console.log(user);
   * // Output:
   * // {
   * //   id: 'user123',
   * //   roles: [
   * //     { id: 'role1', scopes: [{ id: 'scope1', name: 'view_dashboard' }] },
   * //     { id: 'role2', scopes: [{ id: 'scope2', name: 'manage_users' }] }
   * //   ],
   * //   scopes: [
   * //     { id: 'scope3', name: 'custom_permission' }
   * //   ]
   * // }
   * ```
   *
   * @throws Error - If the query encounters a database issue.
   *
   * @remarks
   * This method is typically used in conjunction with higher-level service
   * methods that process and deduplicate scopes for authorization purposes.
   */
  async findUserWithScopes(userId: string): Promise<User | null> {
    return this.findOne({
      where: { id: userId },
      // relations: [
      //   'roles.scopes', // Fetch scopes associated with the user's roles
      //   // 'scopes',       // Fetch custom scopes directly assigned to the user
      // ],
    });
  }
}
