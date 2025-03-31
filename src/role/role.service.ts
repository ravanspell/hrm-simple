import { RoleRepository } from '@/role/repository/role.repository';
import { UserRoleRepository } from '@/role/repository/user-role.repository';
import { Injectable, NotFoundException } from '@nestjs/common';
import {
  IsolationLevel,
  Propagation,
  Transactional,
} from 'typeorm-transactional';
import { Role } from './entities/role.entity';
import { CreateRoleRequest } from './dto/create-role.dto';

@Injectable()
export class RoleService {
  constructor(
    private readonly roleRepository: RoleRepository,
    private readonly userRoleRepository: UserRoleRepository,
  ) {}

  /**
   * Create a new role.
   * @param createRoleData - The data to create the role.
   * @param organizationId - The ID of the organization.
   * @returns The created role.
   */
  async createRole(
    createRoleData: CreateRoleRequest,
    organizationId: string,
  ): Promise<Role> {
    const role = new Role();
    role.name = createRoleData.name;
    role.description = createRoleData.description;
    role.organizationId = organizationId;
    return this.roleRepository.saveRole(role);
  }
  /**
   * Fetch roles by their IDs.
   * @param roleIds - An array of role IDs.
   * @returns An array of Role entities.
   */
  async findRolesByIds(roleIds: string[]): Promise<Role[]> {
    const roles = await this.roleRepository.findRolesByIds(roleIds);

    if (roles.length !== roleIds.length) {
      throw new NotFoundException(
        `Some roles could not be found. Ensure all role IDs are valid.`,
      );
    }

    return roles;
  }

  /**
   * Assign multiple roles to a user.
   * @param userId - The ID of the user.
   * @param roleIds - An array of role IDs to assign.
   * @returns The updated user entity with the assigned roles.
   */
  // async updateUserRoles(userId: string, roleIds: string[]): Promise<User> {
  //     // Fetch the user along with their current roles
  //     const user = await this.findUserWithRoles(userId);
  //     // Fetch the roles by the provided role IDs
  //     const newRoles = await this.roleService.findRolesByIds(roleIds);
  //     // Assign the new roles to the user
  //     user.roles = newRoles;
  //     // Save the user with updated roles
  //     return await this.userRepository.saveUser(user);
  //   }
  /**
   * Assigns roles to a user and retrieves the list of associated scopes.
   *
   * @param userId - The ID of the user.
   * @param roleIds - An array of role IDs to assign to the user.
   * @returns A Promise resolving to a list of unique scopes associated with the assigned roles.
   * @throws NotFoundException if any of the roles are invalid.
   */
  async assignRolesToUser(userId: string, roleIds: string[]): Promise<any[]> {
    // Validate roles
    const roles = await this.findRolesByIds(roleIds);

    // Assign roles to the user
    await this.userRoleRepository.assignRolesToUser(userId, roleIds);

    // Collect and deduplicate scopes from assigned roles
    const scopes = roles.flatMap((role) => role.rolePermissions);
    return Array.from(new Set(scopes.map((scope) => scope.id))).map((id) =>
      scopes.find((scope) => scope.id === id),
    );
  }
  /**
   * Assigns permissions to a role and updates all users with this role
   */
  @Transactional({
    propagation: Propagation.NESTED,
    isolationLevel: IsolationLevel.READ_COMMITTED,
  })
  async assignPermissionsToRole(roleId: string, permissionIds: string[]) {
    console.log('assignPermissionsToRole-->', roleId, permissionIds);
    // Step 1: Assign permissions to the role
    // await this.rolePermissionsRepo.assignPermissions(roleId, permissionIds);
    // // Step 2: Get all users assigned to this role
    // const userIds = await this.userRolesRepo.findUsersByRole(roleId);
    // if (userIds.length === 0) return;
    // // Step 3: Update permissions for affected users
    // await this.effectivePermissionsRepo.updatePermissionsForUsers(userIds, permissionIds);
  }
}
