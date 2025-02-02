import { DataSource, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { PermissionCategory } from '../entities/permission-category.entity';

@Injectable()
export class PermissionCategoryRepository extends Repository<PermissionCategory> {
  constructor(dataSource: DataSource) {
    super(PermissionCategory, dataSource.createEntityManager());
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
}
