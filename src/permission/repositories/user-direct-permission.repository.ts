import { DataSource, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { UserDirectPermission } from '../entities/user-direct-permission.entity';

@Injectable()
export class UserDirectPermissionRepository extends Repository<UserDirectPermission> {
  constructor(dataSource: DataSource) {
    super(UserDirectPermission, dataSource.createEntityManager());
  }

  /**
   * Find user permission with write lock
   * @param userId User ID
   * @param systemPermissionId System Permission ID
   * @param organizationId Organization ID
   * @returns UserDirectPermission
   */
  async findWithLock(
    userId: string,
    systemPermissionId: string,
    organizationId: string,
  ): Promise<UserDirectPermission> {
    return this.findOne({
      where: { userId, systemPermissionId, organizationId },
      // lock: { mode: LockMode.PESSIMISTIC_WRITE }
    });
  }

  /**
   * Find all direct permissions for a user in an organization
   * @param userId User ID
   * @param organizationId Organization ID
   * @returns UserDirectPermission[]
   */
  async findByUserAndOrganization(
    userId: string,
    organizationId: string,
  ): Promise<UserDirectPermission[]> {
    return this.find({
      where: { userId, organizationId },
      relations: ['systemPermission'],
    });
  }
}
