import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class TblLeaveHistoryRepository {
    constructor(private readonly databaseService: DatabaseService) {}

  create(createEmployeeLeafDto: any) {
    return `This action returns all employeeLeaves`;
  }

  findAll() {
    return `This action returns all employeeLeaves`;
  }

  findOne(id: number) {
    return `This action returns a #${id} employeeLeaf`;
  }

  update(id: number, updateEmployeeLeafDto: any) {
    return `This action updates a #${id} employeeLeaf`;
  }

  remove(id: number) {
    return `This action removes a #${id} employeeLeaf`;
  }
}
