import { DataSource, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { SystemPermission } from '../entities/system-permission.entity';
import { PermissionQueryDto } from '../dto/dto';
import { SYSTEM_PERMISSION_COLUMNS } from '../constants/table-columns';

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
      .orderBy(`permission.${SYSTEM_PERMISSION_COLUMNS.CREATED_AT}`, 'DESC');

    if (search) {
      queryBuilder.andWhere(
        `(permission.${SYSTEM_PERMISSION_COLUMNS.DISPLAY_NAME} ILIKE :search OR permission.${SYSTEM_PERMISSION_COLUMNS.DESCRIPTION} ILIKE :search)`,
        { search: `%${search}%` },
      );
    }

    if (categoryId) {
      queryBuilder.andWhere(
        `permission.${SYSTEM_PERMISSION_COLUMNS.CATEGORY_ID} = :categoryId`,
        {
          categoryId,
        },
      );
    }

    if (resource) {
      queryBuilder.andWhere('permission.resource = :resource', { resource });
    }

    if (basePermissionsOnly !== undefined) {
      queryBuilder.andWhere(
        `permission.${SYSTEM_PERMISSION_COLUMNS.IS_BASE_PERMISSION} = :basePermissionsOnly`,
        {
          basePermissionsOnly,
        },
      );
    }

    return queryBuilder.skip(skip).take(take).getManyAndCount();
  }

  /**
   * Upsert a system permission
   * If a permission with the same id exists, it will be updated
   * If no permission exists with the id, a new one will be created
   * @param systemPermissionData Permission data to upsert
   * @returns SystemPermission
   */
  async upsertPermission(
    systemPermissionData: Partial<SystemPermission>,
  ): Promise<SystemPermission> {
    const result = await this.createQueryBuilder()
      .insert()
      .into(SystemPermission)
      .values(systemPermissionData)
      .orUpdate(
        [
          SYSTEM_PERMISSION_COLUMNS.TYPE,
          SYSTEM_PERMISSION_COLUMNS.CATEGORY_ID,
          SYSTEM_PERMISSION_COLUMNS.DISPLAY_NAME,
          SYSTEM_PERMISSION_COLUMNS.DESCRIPTION,
          SYSTEM_PERMISSION_COLUMNS.IS_BASE_PERMISSION,
          SYSTEM_PERMISSION_COLUMNS.UPDATED_BY,
        ],
        [SYSTEM_PERMISSION_COLUMNS.ID],
      )
      .returning('*')
      .execute();

    return result.raw[0];
  }
}
