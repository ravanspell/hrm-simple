import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateScopeDto } from './dto/create-scope.dto';
import { UpdateScopeDto } from './dto/update-scope.dto';

@Injectable()
export class ScopesService {
  // constructor(
  //   private readonly databaseService: DatabaseService
  // ) {}
  /**
   * Creates a new scope in the system.
   *
   * @param createScopeDto - DTO containing the scope details
   * @returns A Promise resolving to the created scope
   */
  // async createScope(
  //   createScopeDto: CreateScopeDto,
  //   organization: string,
  // ): Promise<any> {
  //   const { name, description, categoryId } = createScopeDto;
  //   return this.databaseService.scope.create({
  //     data: {
  //       name,
  //       description,
  //       category: {
  //         connect: { id: categoryId },
  //       },
  //       organization: { connect: { id: organization } },
  //     },
  //   });
  // }
  /**
   * Updates an existing scope.
   *
   * @param scopeId - The ID of the scope to update
   * @param updateScopeDto - DTO containing the updated scope details
   * @returns A Promise resolving to the updated scope
   * @throws NotFoundException if the scope is not found
   */
  // async updateScope(
  //   scopeId: string,
  //   updateScopeDto: UpdateScopeDto,
  // ): Promise<any> {
  //   const { name, description, categoryId } = updateScopeDto;
  //   // Ensure the scope exists
  //   const existingScope = await this.findById(scopeId);
  //   return this.databaseService.scope.update({
  //     where: { id: scopeId },
  //     data: {
  //       name: name ?? existingScope.name,
  //       description: description ?? existingScope.description,
  //       category: categoryId ?? existingScope.category,
  //     },
  //   });
  // }
  /**
   * Retrieves a scope by its ID.
   *
   * @param scopeId - The ID of the scope to retrieve
   * @returns A Promise resolving to the scope
   * @throws NotFoundException if the scope is not found
   */
  // async findById(scopeId: string): Promise<any> {
  //   const scope = await this.databaseService.scope.findUnique({
  //     where: { id: scopeId },
  //   });
  //   if (!scope) {
  //     throw new NotFoundException(`Scope with ID ${scopeId} not found.`);
  //   }
  //   return scope;
  // }
  /**
   * Deletes a scope by its ID.
   *
   * @param scopeId - The ID of the scope to delete
   * @returns A Promise resolving to the deleted scope
   * @throws NotFoundException if the scope is not found
   */
  // async deleteScope(scopeId: string): Promise<any> {
  //   await this.findById(scopeId); // Ensure scope exists
  //   return this.databaseService.scope.delete({
  //     where: { id: scopeId },
  //   });
  // }
}
