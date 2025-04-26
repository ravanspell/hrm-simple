import { DataSource, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { EffectiveUserPermission } from '../entities/effective-user-permissions.entity';

@Injectable()
export class EffectiveUserPermissionsRepository extends Repository<EffectiveUserPermission> {
  constructor(dataSource: DataSource) {
    super(EffectiveUserPermission, dataSource.createEntityManager());
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
   * Get effective permissions for a user
   *
   * @param userId User ID
   * @returns Effective permissions
   */
  async getUserPermissions(userId: string) {
    return this.createQueryBuilder('eup')
      .select([
        'eup.permission AS permissionKey',
        'eup.origin AS origin',
        'eup.lastUpdated AS lastUpdated',
      ])
      .where('eup.userId = :userId', { userId })
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
