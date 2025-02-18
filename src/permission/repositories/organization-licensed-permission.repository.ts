import { DataSource, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { OrganizationLicensedPermission } from '../entities/organization-licensed-permission.entity';

@Injectable()
export class OrganizationLicensedPermissionRepository extends Repository<OrganizationLicensedPermission> {
  constructor(dataSource: DataSource) {
    super(OrganizationLicensedPermission, dataSource.createEntityManager());
  }

  /**
   * Find licensed permission with write lock
   * @param organizationId Organization ID
   * @param systemPermissionId System Permission ID
   * @returns OrganizationLicensedPermission
   */
  async findWithLock(
    organizationId: string,
    systemPermissionId: string,
  ): Promise<OrganizationLicensedPermission> {
    return this.findOne({
      where: { organizationId, systemPermissionId },
      // lock: { mode: LockMode.PESSIMISTIC_WRITE }
    });
  }

  /**
   * Find active licenses for an organization
   * @param organizationId Organization ID
   * @returns OrganizationLicensedPermission[]
   */
  async findActiveByOrganization(
    organizationId: string,
  ): Promise<OrganizationLicensedPermission[]> {
    const now = new Date();
    return this.createQueryBuilder('license')
      .where('license.organizationId = :organizationId', { organizationId })
      .andWhere('license.isActive = true')
      .andWhere('license.validFrom <= :now', { now })
      .andWhere('(license.validUntil IS NULL OR license.validUntil >= :now)', {
        now,
      })
      .getMany();
  }
}
