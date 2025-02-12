import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
// import { FilterUsersDto, Gender } from './dto/filter-user.dto';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Organization } from '@/organization/entities/organization.entity';
import { UserRepository } from 'src/repository/user.repository';
import { RoleRepository } from '@/repository/role.repository';
import { RolesService } from './roles.service';

export type UserWithScopes = Omit<User, 'roles' | 'scopes'> & {
  roles?: any[]; // Optional if roles are included for debugging purposes
  scopes: string[]; // The flat array of unique scope names
};

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
    private readonly userRepository: UserRepository,
    private readonly roleRepository: RoleRepository,
    private readonly roleService: RolesService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Fetch related entities (Organization, EmploymentStatus, EmployeeLevel)
    const organization = await this.organizationRepository.findOne({
      where: { id: 'wewe' },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    // Create the user instance
    const user = this.userRepository.create({
      firstName: createUserDto.firstName,
      lastName: createUserDto.lastName,
      email: createUserDto.email,
      gender: createUserDto.gender,
      dateOfBirth: new Date(createUserDto.dateOfBirth),
      startDate: new Date(),
      organization: organization, // Link to the fetched organization
      employmentStatusId: 'wewee', // Direct assignment (assuming foreign keys)
      employeeLevelId: 'wewewe', // Direct assignment (assuming foreign keys)
      createdBy: 'wewewxxe',
      updatedBy: 'wewewxxe',
    });

    // Save the user in the database
    return await this.userRepository.save(user);
  }

  // async filterUsers(filters: FilterUsersDto[], orgId: string) {
  //   const conditions: Prisma.UserWhereInput[] = [
  //     {
  //       organizationId: orgId,
  //     },
  //   ];

  //   // Track whether we need to include relations like employeeLevel or employmentStatus
  //   let includeEmployeeLevel = false;
  //   let includeEmploymentStatus = false;

  //   // Loop through the filters provided by the user and build dynamic conditions
  //   filters.forEach((filter) => {
  //     const { field, operator, value, logic } = filter;

  //     // Skip empty or invalid filters
  //     if (!value || value === '') return;

  //     // Push conditions based on the field, operator, and value
  //     switch (field) {
  //       case 'gender':
  //         if (operator === 'is' && typeof value === 'string') {
  //           conditions.push({
  //             gender: value as Gender, // Directly match gender field
  //           });
  //         }
  //         break;
  //       case 'employeeLevel':
  //         includeEmployeeLevel = true;
  //         if (operator === 'is' && value) {
  //           conditions.push({
  //             employeeLevelId: value as string, // Prisma will auto-join employeeLevel based on this condition
  //           });
  //         }
  //         break;
  //       case 'employmentStatus':
  //         includeEmploymentStatus = true;
  //         if (operator === 'is' && value) {
  //           conditions.push({
  //             employmentStatusId: value as string, // Prisma will auto-join employmentStatus based on this condition
  //           });
  //         }
  //         break;
  //       // Add more cases for different fields if needed
  //       default:
  //         break;
  //     }
  //   });

  //   // Dynamic AND/OR logic
  //   const logic = filters.some((filter) => filter.logic === 'OR')
  //     ? 'OR'
  //     : 'AND';
  //   const whereClause: Prisma.UserWhereInput = {};
  //   if (conditions.length > 0) {
  //     whereClause[logic] = conditions; // Apply the logic (AND/OR) based on filters
  //   }

  //   // Define the fields to select
  //   const selectClause: Prisma.UserSelect = {
  //     id: true,
  //     firstName: true,
  //     lastName: true,
  //     email: true,
  //     gender: true,
  //     employeeLevel: includeEmployeeLevel
  //       ? {
  //         select: {
  //           name: true,
  //           description: true,
  //         },
  //       }
  //       : false, // Conditionally include employeeLevel with name
  //     employmentStatus: includeEmploymentStatus
  //       ? {
  //         select: {
  //           status: true,
  //           description: true,
  //         },
  //       }
  //       : false, // Conditionally include employmentStatus with status
  //   };

  //   // Build the query with optional includes (employeeLevel/employmentStatus) and dynamic where clause
  //   const users = await this.databaseService.user.findMany({
  //     where: whereClause,
  //     select: selectClause,
  //   });
  //   return users;
  // }

  async findOne(email: string): Promise<User> {
    const user = await this.userRepository.findUser(email);

    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    return user;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  /**
   * Fetch a user with their roles by user ID.
   * @param userId - The ID of the user.
   * @returns The User entity with roles.
   */
  async findUserWithRoles(userId: string): Promise<User> {
    const user = await this.userRepository.findUserWithRoles(userId);

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }

    return user;
  }

  /**
   * Assign multiple roles to a user.
   * @param userId - The ID of the user.
   * @param roleIds - An array of role IDs to assign.
   * @returns The updated user entity with the assigned roles.
   */
  async updateUserRoles(userId: string, roleIds: string[]): Promise<User> {
    // Fetch the user along with their current roles
    const user = await this.findUserWithRoles(userId);
    // Fetch the roles by the provided role IDs
    const newRoles = await this.roleService.findRolesByIds(roleIds);
    // Assign the new roles to the user
    user.roles = newRoles;
    // Save the user with updated roles
    return await this.userRepository.saveUser(user);
  }

  /**
   * Fetch a user's assigned scopes.
   *
   * This method retrieves all scopes assigned to a user, combining:
   * - Role-based scopes (inherited from the user's assigned roles).
   * - Custom scopes (directly assigned to the user).
   *
   * The result is returned as a flat array of unique scope names, suitable for
   * permission checks.
   *
   * @param userId - The unique identifier of the user.
   * @returns A promise that resolves to an object containing:
   *   - `id`: The user's ID.
   *   - `scopes`: An array of unique scope names assigned to the user.
   * @throws NotFoundException - If the user is not found.
   *
   * @example
   * ```typescript
   * const result = await this.userService.findUserWithScopes('user123');
   * console.log(result);
   * // {
   * //   id: 'user123',
   * //   scopes: ['view_dashboard', 'manage_users', 'custom_permission']
   * // }
   * ```
   */
  async findUserWithScopes(userId?: string): Promise<UserWithScopes> {
    const user = await this.userRepository.findUserWithScopes(userId);
    console.log('user--->', user);

    if (!user) {
      throw new NotFoundException('User with ID not found.');
    }

    // Combine role-based scopes and custom scopes
    const roleBasedScopes = user.roles.flatMap((role) => role.scopes);
    const customScopes = user?.scopes || [];

    // Merge all scopes, deduplicate by scope name
    const combinedScopes = Array.from(
      new Set([...roleBasedScopes, ...customScopes].map((scope) => scope.name)),
    );

    return {
      ...user,
      scopes: combinedScopes,
    };
  }
}
