import { Module } from '@nestjs/common';
import { EmployeeLeavesService } from './employee-leaves.service';
import { EmployeeLeavesController } from './employee-leaves.controller';

@Module({
  controllers: [EmployeeLeavesController],
  providers: [EmployeeLeavesService],
})
export class EmployeeLeavesModule {}
