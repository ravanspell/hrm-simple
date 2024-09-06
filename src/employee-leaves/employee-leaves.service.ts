import { Injectable } from '@nestjs/common';
import { CreateEmployeeLeafDto } from './dto/create-employee-leaf.dto';
import { UpdateEmployeeLeafDto } from './dto/update-employee-leaf.dto';

@Injectable()
export class EmployeeLeavesService {
  create(createEmployeeLeafDto: CreateEmployeeLeafDto) {
    return 'This action adds a new employeeLeaf';
  }

  findAll() {
    return `This action returns all employeeLeaves`;
  }

  findOne(id: number) {
    return `This action returns a #${id} employeeLeaf`;
  }

  update(id: number, updateEmployeeLeafDto: UpdateEmployeeLeafDto) {
    return `This action updates a #${id} employeeLeaf`;
  }

  remove(id: number) {
    return `This action removes a #${id} employeeLeaf`;
  }
}
