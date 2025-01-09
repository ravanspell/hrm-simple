import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RoleRepository } from '@/repository/role.repository';
import { Role } from './entities/role.entity';
import { UserRoleRepository } from '@/repository/user-role.repository';

@Injectable()
export class RolesService {
  constructor(
    // private readonly databaseService: DatabaseService,
    private readonly roleRepository: RoleRepository,
    private readonly userRoleRepository: UserRoleRepository,
  ) {}

  /**
   * Creates a new role in the system.
   *
   * @param createRoleDto - DTO containing the role details
   * @returns A Promise resolving to the created role, including its associated scopes
   */
  // async createRole(
  //   createRoleDto: CreateRoleDto,
  //   organizationId: string,
  // ): Promise<any> {
  //   const { name, description, scopeIds } = createRoleDto;

  //   return this.databaseService.role.create({
  //     data: {
  //       name,
  //       description,
  //       organizationId,
  //       scopes: {
  //         connect: scopeIds?.map((id) => ({ id })), // Connect to existing scopes
  //       },
  //     },
  //     include: { scopes: true }, // Return the associated scopes
  //   });
  // }

  /**
   * Updates an existing role.
   *
   * @param roleId - The ID of the role to update
   * @param updateRoleDto - DTO containing the updated role details
   * @returns A Promise resolving to the updated role, including its associated scopes
   * @throws NotFoundException if the role is not found
   */
  // async updateRole(roleId: string, updateRoleDto: UpdateRoleDto): Promise<any> {
  //   const { name, description, scopeIds } = updateRoleDto;

  //   // Ensure the role exists
  //   await this.findById(roleId);

  //   // Build the update data object dynamically
  //   const updateData: any = {};
  //   if (name !== undefined) updateData.name = name;
  //   if (description !== undefined) updateData.description = description;
  //   if (scopeIds !== undefined) {
  //     updateData.scopes = {
  //       set: scopeIds.map((id) => ({ id })),
  //     };
  //   }

  //   return this.databaseService.role.update({
  //     where: { id: roleId },
  //     data: updateData,
  //     include: { scopes: true },
  //   });
  // }
  /**
   * Retrieves a role by its ID.
   *
   * @param roleId - The ID of the role to retrieve
   * @returns A Promise resolving to the role, including its associated scopes
   * @throws NotFoundException if the role is not found
   */
  // async findById(roleId: string): Promise<any> {
  //   const role = await this.databaseService.role.findUnique({
  //     where: { id: roleId },
  //     include: { scopes: true },
  //   });

  //   if (!role) {
  //     throw new NotFoundException(`Role with ID ${roleId} not found.`);
  //   }
  //   return role;
  // }

  /**
   * Deletes a role by its ID.
   *
   * @param roleId - The ID of the role to delete
   * @returns A Promise resolving to the deleted role
   * @throws NotFoundException if the role is not found
   */
  // async deleteRole(roleId: string): Promise<any> {
  //   await this.findById(roleId); // Ensure role exists

  //   return this.databaseService.role.delete({ where: { id: roleId } });
  // }

  /**
   * Fetch roles by their IDs.
   * @param roleIds - An array of role IDs.
   * @returns An array of Role entities.
   */
  async findRolesByIds(roleIds: string[]): Promise<Role[]> {
    const roles = await this.roleRepository.findRolesByIds(roleIds);

    if (roles.length !== roleIds.length) {
      throw new NotFoundException(
        `Some roles could not be found. Ensure all role IDs are valid.`,
      );
    }

    return roles;
  }

  /**
   * Assigns roles to a user and retrieves the list of associated scopes.
   *
   * @param userId - The ID of the user.
   * @param roleIds - An array of role IDs to assign to the user.
   * @returns A Promise resolving to a list of unique scopes associated with the assigned roles.
   * @throws NotFoundException if any of the roles are invalid.
   */
  async assignRolesToUser(userId: string, roleIds: string[]): Promise<any[]> {
    // Validate roles
    const roles = await this.findRolesByIds(roleIds);

    // Assign roles to the user
    await this.userRoleRepository.assignRolesToUser(userId, roleIds);

    // Collect and deduplicate scopes from assigned roles
    const scopes = roles.flatMap((role) => role.scopes);
    return Array.from(new Set(scopes.map((scope) => scope.id))).map((id) =>
      scopes.find((scope) => scope.id === id),
    );
  }
}
