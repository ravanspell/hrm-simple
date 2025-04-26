import { UserRole } from '@/role/entities/user-role.entity';
import { Injectable } from '@nestjs/common';
import { Repository, DataSource, In } from 'typeorm';

@Injectable()
export class UserRoleRepository extends Repository<UserRole> {
  constructor(dataSource: DataSource) {
    super(UserRole, dataSource.createEntityManager());
  }

  /**
   * Get all roles for a user
   *
   * @param userId - The ID of the user
   * @returns Array of role IDs
   */
  async getUserRoles(userId: string): Promise<string[]> {
    const userRoles = await this.find({
      where: { userId },
      select: ['roleId'],
    });
    return userRoles.map((role) => role.roleId);
  }

  /**
   * Remove specific roles from a user
   *
   * @param userId - The ID of the user
   * @param roleIds - Array of role IDs to remove
   */
  async removeRolesFromUser(userId: string, roleIds: string[]): Promise<void> {
    await this.delete({
      userId,
      roleId: In(roleIds),
    });
  }

  /**
   * Add roles to a user
   *
   * @param userId - The ID of the user
   * @param roleIds - Array of role IDs to add
   * @param organizationId - The ID of the organization
   */
  async addRolesToUser(
    userId: string,
    roleIds: string[],
    organizationId: string,
  ): Promise<void> {
    const userRoles = roleIds.map((roleId) => ({
      userId,
      roleId,
      organizationId,
    }));
    await this.save(userRoles);
  }

  /**
   * Finds all users assigned to a specific role
   *
   * @param roleId - The ID of the role
   * @returns Array of user IDs
   */
  async findUsersByRole(roleId: string): Promise<string[]> {
    const userRoles = await this.find({
      where: { role: { id: roleId } },
      relations: ['user'],
    });
    return userRoles.map((userRole) => userRole.user.id);
  }
}
