import { DataSource, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { SystemPermission } from '../entities/system-permission.entity';
import { PermissionQueryDto } from '../dto/dto';

@Injectable()
export class SystemPermissionRepository extends Repository<SystemPermission> {
  constructor(dataSource: DataSource) {
    super(SystemPermission, dataSource.createEntityManager());
  }

  /**
   * Create permission
   * @param systemPermissionData
   * @returns SystemPermission
   */
  async createPermission(
    systemPermissionData: SystemPermission,
  ): Promise<SystemPermission> {
    const permission = this.create(systemPermissionData);
    return this.save(permission);
  }

  /**
   * Find permission with write lock
   * @param id Permission ID
   * @returns SystemPermission
   */
  async findByIdWithLock(id: string): Promise<SystemPermission> {
    return this.findOne({
      where: { id },
      relations: ['category'],
    });
  }

  /**
   * Find permissions by query parameters
   * @param queryDto Query parameters
   * @param skip Number of records to skip
   * @param take Number of records to take
   * @returns Tuple of [permissions, total count]
   */
  async findByQueryParams(
    queryDto: PermissionQueryDto,
    skip: number,
    take: number,
  ): Promise<[SystemPermission[], number]> {
    const { search, categoryId, resource, basePermissionsOnly } = queryDto;

    const queryBuilder = this.createQueryBuilder('permission')
      .leftJoinAndSelect('permission.category', 'category')
      .orderBy('permission.createdAt', 'DESC');

    if (search) {
      queryBuilder.andWhere(
        '(permission.displayName ILIKE :search OR permission.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (categoryId) {
      queryBuilder.andWhere('permission.categoryId = :categoryId', {
        categoryId,
      });
    }

    if (resource) {
      queryBuilder.andWhere('permission.resource = :resource', { resource });
    }

    if (basePermissionsOnly !== undefined) {
      queryBuilder.andWhere(
        'permission.isBasePermission = :basePermissionsOnly',
        {
          basePermissionsOnly,
        },
      );
    }

    return queryBuilder.skip(skip).take(take).getManyAndCount();
  }
}
