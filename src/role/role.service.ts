import { RoleRepository } from '@/role/repository/role.repository';
import { UserRoleRepository } from '@/role/repository/user-role.repository';
import { RolePermissionRepository } from '@/role/repository/role-permission.repository';
import { BadRequestException, Injectable } from '@nestjs/common';
import { IsolationLevel, Transactional } from 'typeorm-transactional';
import { Role } from './entities/role.entity';
import { CreateRoleRequest } from './dto/create-role.dto';
import { SessionService } from '@/auth/session.service';
import { In } from 'typeorm';

@Injectable()
export class RoleService {
  constructor(
    private readonly roleRepository: RoleRepository,
    private readonly userRoleRepository: UserRoleRepository,
    private readonly rolePermissionRepository: RolePermissionRepository,
    private readonly sessionService: SessionService,
  ) {}

  /**
   * Get a role by its ID.
   *
   * @param id - The ID of the role.
   * @returns The role.
   */
  async getRoleById(id: string): Promise<Role> {
    return this.roleRepository.findOne({ where: { id } });
  }

  /**
   * Create a new role.
   *
   * @param createRoleData - The data to create the role.
   * @param organizationId - The ID of the organization.
   * @returns The created role.
   */
  @Transactional({
    isolationLevel: IsolationLevel.READ_COMMITTED,
  })
  async createRole(
    createRoleData: CreateRoleRequest,
    organizationId: string,
  ): Promise<Role> {
    const role = new Role();
    role.name = createRoleData.name;
    role.description = createRoleData.description;
    role.organizationId = organizationId;
    role.createdBy = createRoleData.createdBy;
    role.updatedBy = createRoleData.updatedBy;

    // First save the role to get its ID
    const savedRole = await this.roleRepository.upsertRole(role);

    // If there are scopeIds, create the role permissions
    if (createRoleData.scopeIds?.length) {
      await this.rolePermissionRepository.assignPermissionsToRole(
        savedRole.id,
        createRoleData.scopeIds,
        createRoleData.createdBy,
      );
    }

    return savedRole;
  }

  /**
   * Fetch roles by their IDs.
   *
   * @param roleIds - An array of role IDs.
   * @returns An array of Role entities.
   */
  async findRolesByIds(roleIds: string[]): Promise<Role[]> {
    const roles = await this.roleRepository.find({
      where: { id: In(roleIds) },
      relations: ['rolePermissions'],
    });

    if (roles.length !== roleIds.length) {
      const foundRoleIds = roles.map((role) => role.id);
      const missingRoleIds = roleIds.filter((id) => !foundRoleIds.includes(id));
      throw new BadRequestException(
        `The following roles do not exist: ${missingRoleIds.join(', ')}`,
      );
    }

    return roles;
  }

  /**
   * Assigns roles to a user and retrieves the list of associated scopes.
   *
   * @param userId - The ID of the user.
   * @param roleIds - An array of role IDs to assign to the user.
   * @returns A Promise resolving to a list of unique scopes associated with the assigned roles.
   * @throws BadRequestException if the user is not found.
   */
  @Transactional({
    isolationLevel: IsolationLevel.READ_COMMITTED,
  })
  async assignRolesToUser(
    userId: string,
    roleIds: string[],
    organizationId: string,
  ): Promise<{ message: string }> {
    // Validate roles exist
    await this.findRolesByIds(roleIds);

    // Get existing roles for the user
    const existingRoles = await this.userRoleRepository.getUserRoles(userId);

    // Find roles to remove (in existing but not in new)
    const rolesToRemove = existingRoles.filter((id) => !roleIds.includes(id));

    // Find roles to add (in new but not in existing)
    const rolesToAdd = roleIds.filter((id) => !existingRoles.includes(id));

    // Remove roles that are no longer needed
    if (rolesToRemove.length > 0) {
      await this.userRoleRepository.removeRolesFromUser(userId, rolesToRemove);
    }

    // Add new roles
    if (rolesToAdd.length > 0) {
      await this.userRoleRepository.addRolesToUser(
        userId,
        rolesToAdd,
        organizationId,
      );
    }

    // Logout the user if their roles were modified
    if (rolesToRemove.length > 0 || rolesToAdd.length > 0) {
      await this.sessionService.deleteUserSessions(userId);
    }

    return {
      message: 'Roles successfully assigned to user',
    };
  }

  /**
   * Assigns permissions to a role and updates all users with this role
   *
   * @param roleId - The ID of the role
   * @param permissionIds - Array of permission IDs to assign
   * @returns Promise<void>
   */
  @Transactional({
    isolationLevel: IsolationLevel.SERIALIZABLE,
  })
  async assignPermissionsToRole(roleId: string, permissionIds: string[]) {
    // Step 1: Verify the role exists
    const role = await this.roleRepository.findOne({ where: { id: roleId } });
    if (!role) {
      throw new BadRequestException(`Role with ID ${roleId} not found`);
    }

    // Step 2: Update permissions gracefully
    await this.rolePermissionRepository.updatePermissionsForRole(
      roleId,
      permissionIds,
      role.createdBy,
    );
  }
}
