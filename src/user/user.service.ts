import { Injectable } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class UserService {
  constructor(private readonly databaseService: DatabaseService) {}
  
  async create(createUserDto: CreateUserDto) {
    return this.databaseService.user.create({ data: {
      firstName: createUserDto.firstName,
      lastName: createUserDto.lastName,
      email: createUserDto.email,
      gender: createUserDto.gender,
      employmentStatus: +createUserDto.employmentStatus,
      employeeLevel: 1,
      organizationId: 1
    }})
  }

  findAll() {
    return this.databaseService.user.findMany()
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
