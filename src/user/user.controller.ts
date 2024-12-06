import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Version,
  Req,
  Put,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
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

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly loggerService: LoggerService,
    private readonly roleService: RolesService,
  ) {}

  /**
   * Create a new user.
   * @param createUserDto Data to create the user.
   */
  @Post()
  @Version('1')
  @ApiOperation({ summary: 'Create a new user' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: 'User successfully created' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  create(@Body() createUserDto: CreateUserDto) {
    this.loggerService.logEmployeeAction(
      'user create req',
      JSON.stringify(createUserDto),
    );
    return this.userService.create(createUserDto);
  }

  /**
   * Filter users based on specific criteria.
   * @param filterUsersDto Filter criteria.
   * @param request The request object containing tenant information.
   */
  @Get()
  @Version('1')
  @Authentication()
  @Permissions('can:filter')
  @ApiOperation({ summary: 'Filter users' })
  @ApiResponse({ status: 200, description: 'Users successfully filtered' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  filter(
    @Body() filterUsersDto: FilterUsersDto[],
    @Req() request: RequestWithTenant,
  ) {
    this.loggerService.logEmployeeAction('im first log here', 'emp id');
    const orgId = request.user.organizationId;
    return this.userService.filterUsers(filterUsersDto, orgId);
  }

  /**
   * Find a user by their ID.
   * @param id User ID.
   */
  @Get(':id')
  @Version('1')
  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiParam({ name: 'id', type: String, description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User found' })
  @ApiResponse({ status: 404, description: 'User not found' })
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  /**
   * Update a user by their ID.
   * @param id User ID.
   * @param updateUserDto Data to update the user.
   */
  @Patch(':id')
  @Version('1')
  @ApiOperation({ summary: 'Update a user by ID' })
  @ApiParam({ name: 'id', type: String, description: 'User ID' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: 200, description: 'User successfully updated' })
  @ApiResponse({ status: 404, description: 'User not found' })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  /**
   * Remove a user by their ID.
   * @param id User ID.
   */
  @Delete(':id')
  @Version('1')
  @ApiOperation({ summary: 'Delete a user by ID' })
  @ApiParam({ name: 'id', type: String, description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User successfully deleted' })
  @ApiResponse({ status: 404, description: 'User not found' })
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }

  // ----------- Roles Management ----------------

  /**
   * Create a new role.
   * @param createRoleData Data to create the role.
   */
  @Post('role')
  @Version('1')
  @ApiOperation({ summary: 'Create a new role' })
  @ApiBody({ type: CreateRoleDto })
  @ApiResponse({ status: 201, description: 'Role successfully created' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  createRole(
    @Body() createRoleData: CreateRoleDto,
    @Req() requestWithTenant: RequestWithTenant,
  ) {
    const organizationId = '69fb3a34-1bcc-477d-8a22-99c194ea468d'; // requestWithTenant.organization.id
    return this.roleService.createRole(createRoleData, organizationId);
  }

  /**
   * Update an existing role by its ID.
   * @param id Role ID.
   * @param updateRoleData Data to update the role.
   */
  @Put('role/:id')
  @Version('1')
  @ApiOperation({ summary: 'Update a role by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Role ID' })
  @ApiBody({ type: UpdateRoleDto })
  @ApiResponse({ status: 200, description: 'Role successfully updated' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  updateRole(@Param('id') id: string, @Body() updateRoleData: UpdateRoleDto) {
    return this.roleService.updateRole(id, updateRoleData);
  }
}
