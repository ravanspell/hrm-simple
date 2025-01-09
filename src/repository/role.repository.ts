import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository, DataSource, In } from 'typeorm';
import { Role } from '@/user/entities/role.entity';

@Injectable()
export class RoleRepository extends Repository<Role> {
  constructor(dataSource: DataSource) {
    super(Role, dataSource.createEntityManager());
  }

  /**
   * Finds a role by its name.
   * @param name - The name of the role to find.
   * @returns A promise that resolves to the found Role entity.
   */
  async findRoleByName(name: string): Promise<Role> {
    const role = await this.findOne({ where: { name } });
    if (!role) {
      throw new NotFoundException(`Role with name "${name}" not found.`);
    }
    return role;
  }

  /**
   * Retrieves all roles with optional inclusion of scopes.
   * @param includeScopes - Whether to include scopes in the result.
   * @returns A promise that resolves to an array of Role entities.
   */
  async findAllRoles(includeScopes: boolean = false): Promise<Role[]> {
    return this.find({ relations: includeScopes ? ['scopes'] : [] });
  }

  /**
   * Finds a role with its associated scopes.
   * @param roleId - The ID of the role to find.
   * @returns A promise that resolves to the found Role entity.
   */
  async findRoleWithScopes(roleId: string): Promise<Role> {
    const role = await this.findOne({
      where: { id: roleId },
      relations: ['scopes'],
    });
    if (!role) {
      throw new NotFoundException(`Role with ID "${roleId}" not found.`);
    }
    return role;
  }

  /**
   * Finds roles by their IDs.
   * Replaces the deprecated `findByIds` method with `findBy` and `In`.
   * @param roleIds - An array of role IDs to find.
   * @returns A promise that resolves to an array of Role entities.
   */
  async findRolesByIds(roleIds: string[]): Promise<Role[]> {
    return this.findBy({ id: In(roleIds) });
  }
}
