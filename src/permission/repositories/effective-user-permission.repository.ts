import { DataSource, Raw, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { UserDirectPermission } from '../entities/user-direct-permission.entity';
import { EffectiveUserPermission } from '../entities/effective-user-permissions.entity';

@Injectable()
export class EffectiveUserPermissionsRepository extends Repository<EffectiveUserPermission> {
  constructor(dataSource: DataSource) {
    super(EffectiveUserPermission, dataSource.createEntityManager());
  }

  /**
   * Adds permissions to users in batches for scalability
   */
  // async addPermissionsForUsersBatch(roleId: string, permissionId: string, batchSize: number, offset: number): Promise<void> {
  //     await this.createQueryBuilder()
  //         .insert()
  //         .values(qb => {
  //             return qb
  //                 .select('ur.user_id', 'userId')
  //                 .addSelect('ur.organization_id', 'organizationId')
  //                 .addSelect(':permissionId', 'permissionKey')
  //                 .addSelect("'ROLE'", 'origin')
  //                 .from('user_roles', 'ur')
  //                 .where('ur.role_id = :roleId', { roleId })
  //                 .limit(batchSize)
  //                 .offset(offset);
  //         })
  //         .orIgnore() // Prevents duplicate inserts
  //         .setParameter('permissionId', permissionId)
  //         .execute();
  // }

  async removeUnusedPermissionsForUsers(
    userIds: string[],
    permissionIds: string[],
  ) {
    await this.createQueryBuilder()
      .delete()
      .where('user_id IN (:...userIds)', { userIds }) // Remove only for these users
      .andWhere('permission_key IN (:...permissionIds)', { permissionIds }) // Remove only these permissions
      .andWhere(`origin = 'ROLE'`) // Only remove role-based permissions, not DIRECT
      .andWhere(
        `NOT EXISTS (
            SELECT 1 FROM user_roles ur
            JOIN role_permissions rp ON ur.role_id = rp.role_id
            WHERE ur.user_id = effective_user_permissions.user_id
            AND rp.system_permission_id = effective_user_permissions.permission_key
          )`,
      ) // Only remove if no other role still grants it
      .execute();
  }

  /**
   * Removes permissions from users in batches
   */
  async removePermissionsForUsersBatch(
    roleId: string,
    permissionId: string,
    batchSize: number,
    offset: number,
  ): Promise<void> {
    await this.createQueryBuilder()
      .delete()
      .where(
        `user_id IN (
        SELECT user_id FROM user_roles
        WHERE role_id = : roleId
        LIMIT : batchSize OFFSET : offset
            )`,
        { roleId, batchSize, offset },
      )
      .andWhere('permission_key = :permissionId', { permissionId })
      .execute();
  }
  /**
   * Get effective permissions for a user in an organization
   */
  // async getEffectiveUserPermissions(userId: string) {
  //     const qb = this
  //         .createQueryBuilder('eup')
  //         .select(['sp.permission_key AS permissionKey', "'ROLE' AS origin"])
  //         .innerJoin('system_permissions', 'sp', 'eup.permission_id = sp.id')
  //         .leftJoin('user_direct_permissions', 'udp',
  //             'udp.user_id = eup.user_id AND udp.system_permission_id = eup.permission_id AND udp.is_override = true'
  //         )
  //         .where('eup.user_id = :userId', { userId })
  //         .andWhere('udp.id IS NULL'); // Ignore overridden permissions

  //     const directPermissionsQb = this
  //         .createQueryBuilder()
  //         .select(['sp.permission_key AS permissionKey', "'DIRECT' AS origin"])
  //         .from('user_direct_permissions', 'udp')
  //         .innerJoin('system_permissions', 'sp', 'udp.system_permission_id = sp.id')
  //         .where('udp.user_id = :userId', { userId })
  //         .andWhere('udp.is_override = false');

  //     return await qb.addUnion(directPermissionsQb).getRawMany();

  //     return permissions;
  // }

  async getUserPermissions(userId: string) {
    const rolePermissionsQb = this.createQueryBuilder('eup')
      .select(['sp.permissionKey AS permissionKey', "'ROLE' AS origin"])
      .innerJoin('system_permissions', 'sp', 'eup.id = sp.id')
      .leftJoin(
        'user_direct_permissions',
        'udp',
        'udp.userId = eup.userId AND udp.systemPermissionId = eup.id AND udp.isOverride = true',
      )
      .where('eup.userId = :userId', { userId })
      .andWhere('udp.id IS NULL'); // Ignore overridden role permissions

    const directPermissionsQb = this.createQueryBuilder()
      .from(UserDirectPermission, 'udp')

      .select(['sp.permissionKey AS permissionKey', "'DIRECT' AS origin"])
      .innerJoin('system_permissions', 'sp', 'udp.systemPermissionId = sp.id')
      .where('udp.userId = :userId', { userId })
      .andWhere('udp.isOverride = false'); // Ignore override removals

    // Manually combine queries using UNION ALL
    return await this.createQueryBuilder()
      .select('*')
      .from(
        `(${rolePermissionsQb.getQuery()} UNION ALL ${directPermissionsQb.getQuery()})`,
        'permissions',
      )
      .setParameters({ userId })
      .getRawMany();
  }

  /**
   * Check if a user has specific permissions in an organization
   */
  // async hasPermissions(userId: string, organizationId: string, permissionIds: string[]): Promise<boolean> {
  //     // Note: Using Raw query only for the array containment check
  //     const result = await this.findOne({
  //         where: {
  //             userId,
  //             organizationId,
  //             activePermissions: Raw(alias => `${alias} @> :permissions`, { permissions: permissionIds })
  //         }
  //     });

  //     return !!result;
  // }
}
