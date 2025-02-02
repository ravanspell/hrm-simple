import { DataSource, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { PermissionCategory } from '../entities/permission-category.entity';

@Injectable()
export class PermissionCategoryRepository extends Repository<PermissionCategory> {
  constructor(dataSource: DataSource) {
    super(PermissionCategory, dataSource.createEntityManager());
  }

  /**
   * Find category with pessimistic write lock
   * @param id Category ID
   * @returns PermissionCategory
   */
  async findByIdWithLock(id: string): Promise<PermissionCategory> {
    return this.findOne({
      where: { id },
      lock: { mode: 'pessimistic_write' },
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
