import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { DatabaseService } from 'src/database/database.service';
import { FilterUsersDto, Gender } from './dto/filter-user.dto';
import { Prisma, User } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private readonly databaseService: DatabaseService) { }

  async create(createUserDto: CreateUserDto) {
    return this.databaseService.user.create({
      data: {
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
        email: createUserDto.email,
        gender: createUserDto.gender,
        dateOfBirth: new Date(createUserDto.dateOfBirth),
        startDate: new Date(),
        // Linking to an existing organization
        organization: {
          connect: { id: 1 },  // Assuming 1 is the ID of an existing organization
        },

        // Linking to an existing employment status
        employmentStatus: {
          connect: { id: 1 },  // Assuming 1 is the ID of an existing employment status
        },

        // Linking to an existing employee level
        employeeLevel: {
          connect: { id: 1 },  // Assuming 1 is the ID of an existing employee level
        },

        createdBy: 1,
        updatedBy: 1
      }
    })
  }

  async filterUsers(filters: FilterUsersDto[]) {
    const conditions: Prisma.UserWhereInput[] = [];

    // Track whether we need to include relations like employeeLevel or employmentStatus
    let includeEmployeeLevel = false;
    let includeEmploymentStatus = false;

    // Loop through the filters provided by the user and build dynamic conditions
    filters.forEach((filter) => {
      const { field, operator, value, logic } = filter;

      // Skip empty or invalid filters
      if (!value || value === '') return;

      // Push conditions based on the field, operator, and value
      switch (field) {
        case 'organization':
          if (operator === 'is' && value) {
            conditions.push({
              organizationId: value as number,
            });
          }
          break;
        case 'gender':
          if (operator === 'is' && typeof value === 'string') {
            conditions.push({
              gender: value as Gender, // Directly match gender field
            });
          }
          break;
        case 'employeeLevel':
          includeEmployeeLevel = true;
          if (operator === 'is' && value) {
            conditions.push({
              employeeLevelId: value as number, // Prisma will auto-join employeeLevel based on this condition
            });
          }
          break;
        case 'employmentStatus':
          includeEmploymentStatus = true;
          if (operator === 'is' && value) {
            conditions.push({
              employmentStatusId: value as number, // Prisma will auto-join employmentStatus based on this condition
            });
          }
          break;
        // Add more cases for different fields if needed
        default:
          break;
      }
    });

    // Dynamic AND/OR logic
    const logic = filters.some((filter) => filter.logic === 'OR') ? 'OR' : 'AND';
    const whereClause: Prisma.UserWhereInput = {};
    if (conditions.length > 0) {
      whereClause[logic] = conditions; // Apply the logic (AND/OR) based on filters
    }

    // Define the fields to select
    const selectClause: Prisma.UserSelect = {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      gender: true,
      employeeLevel: includeEmployeeLevel ? {
        select: {
          name: true,
          description: true,
        }
      } : false,  // Conditionally include employeeLevel with name
      employmentStatus: includeEmploymentStatus ? {
        select: {
          status: true,
          description: true,
        }
      } : false,  // Conditionally include employmentStatus with status
    };

    // Build the query with optional includes (employeeLevel/employmentStatus) and dynamic where clause
    const users = await this.databaseService.user.findMany({
      where: whereClause,
      select: selectClause,
    });
    return users;
  }

  async findOne(email: string): Promise<User> {
    const user = await this.databaseService.user.findUnique({
      where: { email },
    });

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
}
