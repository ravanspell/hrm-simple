import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(private readonly databaseService: DatabaseService) {}

  /**
   * Creates a new role in the system.
   *
   * @param createRoleDto - DTO containing the role details
   * @returns A Promise resolving to the created role, including its associated scopes
   */
  async createRole(
    createRoleDto: CreateRoleDto,
    organizationId: string,
  ): Promise<any> {
    const { name, description, scopeIds } = createRoleDto;

    return this.databaseService.role.create({
      data: {
        name,
        description,
        organizationId,
        scopes: {
          connect: scopeIds?.map((id) => ({ id })), // Connect to existing scopes
        },
      },
      include: { scopes: true }, // Return the associated scopes
    });
  }

  /**
   * Updates an existing role.
   *
   * @param roleId - The ID of the role to update
   * @param updateRoleDto - DTO containing the updated role details
   * @returns A Promise resolving to the updated role, including its associated scopes
   * @throws NotFoundException if the role is not found
   */
  async updateRole(roleId: string, updateRoleDto: UpdateRoleDto): Promise<any> {
    const { name, description, scopeIds } = updateRoleDto;

    // Ensure the role exists
    await this.findById(roleId);

    // Build the update data object dynamically
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (scopeIds !== undefined) {
      updateData.scopes = {
        set: scopeIds.map((id) => ({ id })),
      };
    }

    return this.databaseService.role.update({
      where: { id: roleId },
      data: updateData,
      include: { scopes: true },
    });
  }
  /**
   * Retrieves a role by its ID.
   *
   * @param roleId - The ID of the role to retrieve
   * @returns A Promise resolving to the role, including its associated scopes
   * @throws NotFoundException if the role is not found
   */
  async findById(roleId: string): Promise<any> {
    const role = await this.databaseService.role.findUnique({
      where: { id: roleId },
      include: { scopes: true },
    });

    if (!role) {
      throw new NotFoundException(`Role with ID ${roleId} not found.`);
    }
    return role;
  }

  /**
   * Deletes a role by its ID.
   *
   * @param roleId - The ID of the role to delete
   * @returns A Promise resolving to the deleted role
   * @throws NotFoundException if the role is not found
   */
  async deleteRole(roleId: string): Promise<any> {
    await this.findById(roleId); // Ensure role exists

    return this.databaseService.role.delete({ where: { id: roleId } });
  }
}
