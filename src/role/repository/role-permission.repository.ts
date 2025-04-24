import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { RolePermission } from '../entities/role-permission.entity';

@Injectable()
export class RolePermissionRepository extends Repository<RolePermission> {
  constructor(dataSource: DataSource) {
    super(RolePermission, dataSource.createEntityManager());
  }

  /**
   * Deletes all permissions for a role.
   * @param roleId - The ID of the role.
   * @returns A Promise that resolves when the permissions are deleted.
   */
  async deletePermissionsForRole(roleId: string): Promise<void> {
    await this.delete({ role: { id: roleId } });
  }

  /**
   * Assigns multiple permissions to a role. First, deletes all existing permissions for the role,
   * then assigns the provided permissions.
   * @param roleId - The ID of the role.
   * @param permissionIds - An array of permission IDs to assign.
   * @param organizationId - The ID of the organization.
   * @param createdBy - The ID of the user creating the permissions.
   * @returns A Promise that resolves when the permissions are assigned.
   */
  async assignPermissionsToRole(
    roleId: string,
    permissionIds: string[],
    organizationId: string,
    createdBy: string,
  ): Promise<void> {
    // Delete existing permissions
    await this.deletePermissionsForRole(roleId);

    // Create new role permissions
    const rolePermissions = permissionIds.map((permissionId) => ({
      role: { id: roleId },
      systemPermissionId: permissionId,
      organizationId,
      createdBy,
    }));

    // Save the new role permissions
    await this.save(rolePermissions);
  }
}
