import { Injectable } from '@nestjs/common';
import { Repository, DataSource, In } from 'typeorm';
import { Role } from '@/role/entities/role.entity';
import { ROLE_COLUMNS } from '../constants/role-columns';

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
    return this.findOne({ where: { name } });
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
    return this.findOne({
      where: { id: roleId },
      relations: ['scopes'],
    });
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

  /**
   * Finds a role by its ID.
   * @param id - The ID of the role to find.
   * @returns A promise that resolves to the found Role entity.
   */
  async findRoleById(id: string): Promise<Role> {
    return this.findOne({ where: { id } });
  }

  /**
   * Upserts a role using the id as the conflict path.
   * If a role with the same id exists, it will be updated.
   * If no role exists, a new one will be created.
   * @param role - The role to upsert.
   * @returns A promise that resolves to the upserted Role entity.
   */
  async upsertRole(role: Role): Promise<Role> {
    const result = await this.createQueryBuilder()
      .insert()
      .into(Role)
      .values(role)
      .orUpdate(
        [
          ROLE_COLUMNS.NAME,
          ROLE_COLUMNS.DESCRIPTION,
          ROLE_COLUMNS.ORGANIZATION_ID,
        ],
        [ROLE_COLUMNS.ID],
      )
      .returning('*')
      .execute();

    return result.raw[0];
  }
}
