import { Injectable } from '@nestjs/common';
import { Repository, DataSource, In } from 'typeorm';
import { RolePermission } from '../entities/role-permission.entity';

@Injectable()
export class RolePermissionRepository extends Repository<RolePermission> {
  constructor(dataSource: DataSource) {
    super(RolePermission, dataSource.createEntityManager());
  }

  /**
   * Updates permissions for a role gracefully by:
   *
   * 1. Removing permissions that are no longer needed
   * 2. Adding new permissions
   * 3. Keeping existing permissions unchanged
   *
   * @param roleId - The ID of the role
   * @param permissionIds - New set of permission IDs
   * @param organizationId - The ID of the organization
   * @param updatedBy - The ID of the user updating the permissions
   */
  async updatePermissionsForRole(
    roleId: string,
    permissionIds: string[],
    createdBy: string,
  ): Promise<void> {
    // Get existing permissions for the role
    const existingPermissions = await this.find({
      where: { roleId },
      select: ['organizationLicensedPermissionId'],
    });
    const existingPermissionIds = existingPermissions.map(
      (p) => p.organizationLicensedPermissionId,
    );

    // Find permissions to remove (in existing but not in new)
    const permissionsToRemove = existingPermissionIds.filter(
      (id) => !permissionIds.includes(id),
    );

    // Find permissions to add (in new but not in existing)
    const permissionsToAdd = permissionIds.filter(
      (id) => !existingPermissionIds.includes(id),
    );

    // Remove permissions that are no longer needed
    if (permissionsToRemove.length > 0) {
      await this.delete({
        roleId,
        organizationLicensedPermissionId: In(permissionsToRemove),
      });
    }

    // Add new permissions
    if (permissionsToAdd.length > 0) {
      const newRolePermissions = permissionsToAdd.map((permissionId) => ({
        roleId,
        organizationLicensedPermissionId: permissionId,
        createdBy,
      }));

      await this.save(newRolePermissions);
    }
  }

  /**
   * Deletes all permissions for a role.
   * @param roleId - The ID of the role.
   * @returns A Promise that resolves when the permissions are deleted.
   */
  async deletePermissionsForRole(roleId: string): Promise<void> {
    await this.delete({ roleId });
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
    createdBy: string,
  ): Promise<void> {
    // Create new role permissions
    const rolePermissions = permissionIds.map((permissionId) => ({
      roleId,
      organizationLicensedPermissionId: permissionId,
      createdBy,
    }));

    // Save the new role permissions
    await this.save(rolePermissions);
  }
}
