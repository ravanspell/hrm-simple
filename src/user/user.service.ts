import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Organization } from '@/organization/entities/organization.entity';
import { UserRepository } from 'src/repository/user.repository';
import { UpdateUserDto } from './dto/update-user.dto';

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
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Fetch related entities (Organization, EmploymentStatus, EmployeeLevel)
    const organization = await this.organizationRepository.findOne({
      where: { id: 'wewe' },
    });

    if (!organization) {
      throw new BadRequestException('Organization not found');
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
    return await this.save(user);
  }

  /**
   * save user data with retrieved user object.
   *
   * @param user obj
   * this method can be used as save user and for update
   * @returns
   */
  async save(user: User): Promise<User> {
    return await this.userRepository.save(user);
  }

  async findOne(email: string): Promise<User> {
    const user = await this.userRepository.findUser(email);

    if (!user) {
      throw new BadRequestException(`User with email ${email} not found`);
    }
    return user;
  }

  async findUserByUserId(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new BadRequestException(`User with id ${id} not found`);
    }
    return user;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user ${updateUserDto}`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
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
      throw new BadRequestException('User with ID not found.');
    }

    // // Combine role-based scopes and custom scopes
    // const roleBasedScopes = user.roles.flatMap((role) => role.rolePermissions);

    // // Merge all scopes, deduplicate by scope name
    // const combinedScopes = Array.from(
    //   new Set([...roleBasedScopes].map((scope) => scope.systemPermissionId)),
    // );

    return {
      ...user,
      scopes: [],
    };
  }

  /**
   * Fined the user data by password reset id to verify password reset
   *
   * @param resetRequestId - Unique reset request identifier provided in the reset link.
   * @returns User - the use data object
   *
   */
  async findResetPasswordUser(resetRequestId: string): Promise<User> {
    const userPasswordResetData = await this.userRepository.findOne({
      where: { resetRequestId },
    });

    if (
      !userPasswordResetData ||
      !userPasswordResetData.resetPasswordToken ||
      !userPasswordResetData.resetPasswordExpires
    ) {
      throw new BadRequestException('Invalid or expired token.');
    }
    return userPasswordResetData;
  }
}
