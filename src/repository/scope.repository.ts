import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { Scope } from '@/user/entities/scope.entity';

@Injectable()
export class ScopeRepository extends Repository<Scope> {
  constructor(dataSource: DataSource) {
    super(Scope, dataSource.createEntityManager());
  }

  /**
   * Finds a scope by its name.
   * @param name - The name of the scope to find.
   * @returns A promise that resolves to the found Scope entity.
   */
  async findScopeByName(name: string): Promise<Scope> {
    const scope = await this.findOne({ where: { name } });
    if (!scope) {
      throw new NotFoundException(`Scope with name "${name}" not found.`);
    }
    return scope;
  }

  /**
   * Retrieves all scopes optionally filtered by category.
   * @param categoryId - The ID of the category to filter scopes (optional).
   * @returns A promise that resolves to an array of Scope entities.
   */
  async findAllScopes(categoryId?: string): Promise<Scope[]> {
    const whereClause = categoryId ? { category: { id: categoryId } } : {};
    return this.find({ where: whereClause, relations: ['category'] });
  }
}
