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
   * @returns [SystemPermission[], number]
   */
  async findByQueryParams(
    queryDto: PermissionQueryDto,
  ): Promise<[SystemPermission[], number]> {
    const { page, limit, search, categoryId, resource, basePermissionsOnly } =
      queryDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.createQueryBuilder(
      'permission',
    ).leftJoinAndSelect('permission.category', 'category');

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

    if (basePermissionsOnly) {
      queryBuilder.andWhere(
        'permission.isBasePermission = :basePermissionsOnly',
        { basePermissionsOnly },
      );
    }

    return queryBuilder.skip(skip).take(limit).getManyAndCount();
  }
}
