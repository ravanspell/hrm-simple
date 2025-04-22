import { DataSource, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { PermissionCategory } from '../entities/permission-category.entity';
import { PERMISSION_CATEGORY_COLUMNS } from '../constants/table-columns';

@Injectable()
export class PermissionCategoryRepository extends Repository<PermissionCategory> {
  constructor(dataSource: DataSource) {
    super(PermissionCategory, dataSource.createEntityManager());
  }

  /**
   * Create or update a permission category
   * If a category with the same key exists, it will be updated
   * If no category exists with the key, a new one will be created
   * @param categoryData Partial<PermissionCategory> data to create or update
   * @returns Created or updated category
   */
  async upsertCategory(
    categoryData: Partial<PermissionCategory>,
  ): Promise<PermissionCategory> {
    const result = await this.createQueryBuilder()
      .insert()
      .into(PermissionCategory)
      .values(categoryData)
      .orUpdate(
        [
          PERMISSION_CATEGORY_COLUMNS.NAME,
          PERMISSION_CATEGORY_COLUMNS.DESCRIPTION,
          PERMISSION_CATEGORY_COLUMNS.DISPLAY_ORDER,
          PERMISSION_CATEGORY_COLUMNS.UPDATED_BY,
        ],
        [PERMISSION_CATEGORY_COLUMNS.KEY],
      )
      .returning('*')
      .execute();

    return result.raw[0];
  }

  /**
   * Find permission category with category id
   * @param id Category ID
   * @returns PermissionCategory
   */
  async findById(id: string): Promise<PermissionCategory> {
    return this.findOne({
      where: { id },
    });
  }

  /**
   * Find category by name with optimistic lock
   * @param name Category name
   * @returns PermissionCategory
   */
  async findByName(name: string): Promise<PermissionCategory> {
    return this.findOne({
      where: { name },
    });
  }

  /**
   * Find category by key
   * @param key Category key
   * @returns PermissionCategory
   */
  async findByKey(key: string): Promise<PermissionCategory> {
    return this.findOne({
      where: { key },
    });
  }
}
