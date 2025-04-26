import { RoleRepository } from '@/role/repository/role.repository';
import { UserRoleRepository } from '@/role/repository/user-role.repository';
import { RolePermissionRepository } from '@/role/repository/role-permission.repository';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { IsolationLevel, Transactional } from 'typeorm-transactional';
import { Role } from './entities/role.entity';
import { CreateRoleRequest } from './dto/create-role.dto';

@Injectable()
export class RoleService {
  constructor(
    private readonly roleRepository: RoleRepository,
    private readonly userRoleRepository: UserRoleRepository,
    private readonly rolePermissionRepository: RolePermissionRepository,
  ) {}

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
    const roles = await this.roleRepository.findRolesByIds(roleIds);

    if (roles.length !== roleIds.length) {
      throw new NotFoundException(
        `Some roles could not be found. Ensure all role IDs are valid.`,
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
