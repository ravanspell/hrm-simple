import { Controller, Get, Post, Body, Patch, Param, Delete, Version, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { LoggerService } from 'src/logger/logger.service';
import { FilterUsersDto } from './dto/filter-user.dto';
import { Permissions } from 'src/decorators/permissions.decorator';
import { Authentication } from 'src/decorators/auth.decorator';


@Controller('user')
export class UserController {
  
  constructor(
    private readonly userService: UserService,
    private readonly loggerService: LoggerService
  ) {}

  @Post()
  @Version('1')
  create(@Body() createUserDto: CreateUserDto) {
    this.loggerService.logEmployeeAction('user create req',JSON.stringify(createUserDto));
    return this.userService.create(createUserDto);
  }

  @Get()
  @Version('1')
  @Authentication()
  @Permissions('can:filter')
  filter(@Body() filterUsersDto: FilterUsersDto[]) {
    this.loggerService.logEmployeeAction('im first log here','emp id');
    return this.userService.filterUsers(filterUsersDto);
  }

  @Get(':id')
  @Version('1')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  @Version('1')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Delete(':id')
  @Version('1')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
