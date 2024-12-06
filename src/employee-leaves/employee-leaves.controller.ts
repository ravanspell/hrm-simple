import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { EmployeeLeavesService } from './employee-leaves.service';
import { CreateEmployeeLeafDto } from './dto/create-employee-leaf.dto';
import { UpdateEmployeeLeafDto } from './dto/update-employee-leaf.dto';

@Controller('employee-leaves')
export class EmployeeLeavesController {
  constructor(private readonly employeeLeavesService: EmployeeLeavesService) {}

  @Post()
  create(@Body() createEmployeeLeafDto: CreateEmployeeLeafDto) {
    return this.employeeLeavesService.create(createEmployeeLeafDto);
  }

  @Get()
  findAll() {
    return this.employeeLeavesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.employeeLeavesService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateEmployeeLeafDto: UpdateEmployeeLeafDto,
  ) {
    return this.employeeLeavesService.update(+id, updateEmployeeLeafDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.employeeLeavesService.remove(+id);
  }
}
