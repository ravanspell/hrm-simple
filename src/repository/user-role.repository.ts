import { UserRole } from '@/user/entities/user-role.entity';
import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';

@Injectable()
export class UserRoleRepository extends Repository<UserRole> {
  constructor(dataSource: DataSource) {
    super(UserRole, dataSource.createEntityManager());
  }

  /**
   * Deletes all roles assigned to a user.
   *
   * @param userId - The ID of the user.
   * @returns A Promise that resolves when the roles are deleted.
   */
  async deleteRolesForUser(userId: string): Promise<void> {
    await this.delete({ user: { id: userId } });
  }

  /**
   * Assigns multiple roles to a user. First, deletes all existing roles for the user,
   * then assigns the provided roles.
   *
   * @param userId - The ID of the user.
   * @param roleIds - An array of role IDs to assign.
   * @returns A Promise that resolves when the roles are assigned.
   */
  async assignRolesToUser(userId: string, roleIds: string[]): Promise<void> {
    // Reuse the method to delete existing roles
    await this.deleteRolesForUser(userId);

    // Assign new roles
    const userRoles = roleIds.map((roleId) => ({
      user: { id: userId },
      role: { id: roleId },
    }));

    await this.save(userRoles);
  }
}
