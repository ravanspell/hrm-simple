import { Controller, Get, Post, Body, Patch, Param, Delete, Version, Req, Put } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { LoggerService } from 'src/logger/logger.service';
import { FilterUsersDto } from './dto/filter-user.dto';
import { Permissions } from 'src/decorators/permissions.decorator';
import { Authentication } from 'src/decorators/auth.decorator';
import { RequestWithTenant } from 'src/coretypes';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';


@Controller('user')
export class UserController {

  constructor(
    private readonly userService: UserService,
    private readonly loggerService: LoggerService,
    private readonly roleService: RolesService
  ) { }

  @Post()
  @Version('1')
  create(@Body() createUserDto: CreateUserDto) {
    this.loggerService.logEmployeeAction('user create req', JSON.stringify(createUserDto));
    return this.userService.create(createUserDto);
  }

  @Get()
  @Version('1')
  @Authentication()
  @Permissions('can:filter')
  filter(@Body() filterUsersDto: FilterUsersDto[], @Req() request: RequestWithTenant) {
    this.loggerService.logEmployeeAction('im first log here', 'emp id');
    const orgId = request.user.organizationId;
    return this.userService.filterUsers(filterUsersDto, orgId);
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

  // ----------- roles ----------------

  @Post('role')
  @Version('1')
  createRole(@Body() createRoleData: CreateRoleDto) {
    return this.roleService.createRole(createRoleData);
  }

  @Put('role/:id')
  @Version('1')
  updateRole(@Param('id') id: string, @Body() updateRoleData: UpdateRoleDto) {
    return this.roleService.updateRole(id, updateRoleData);
  }
}
