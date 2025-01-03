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
  Res,
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
import { CreateScopeDto } from './dto/create-scope.dto';
import { ScopesService } from './scops.service';
import { UpdateScopeDto } from './dto/update-scope.dto';
import { UpdateUserRolesDto } from './dto/update-user-role.dto';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly loggerService: LoggerService,
    private readonly roleService: RolesService,
    private readonly scopeService: ScopesService,
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
    return '';
    // this.userService.filterUsers(filterUsersDto, orgId);
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
    return '';
    // this.roleService.createRole(createRoleData, organizationId);
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
    return;
    // this.roleService.updateRole(id, updateRoleData);
  }

  //------------- scopes ----------------------------
  /**
   * Create a new scope.
   *
   * @param createScopeDto - Data transfer object containing scope details
   * @returns The created scope
   */
  @Post('scope')
  @ApiOperation({ summary: 'Create a new scope' })
  @ApiResponse({
    status: 201,
    description: 'The scope has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  async createScope(
    @Body() createScopeDto: CreateScopeDto,
    @Res() requestWithTenant: RequestWithTenant,
  ): Promise<any> {
    const organizationId = '69fb3a34-1bcc-477d-8a22-99c194ea468d'; // requestWithTenant
    return;
    // this.scopeService.createScope(createScopeDto, organizationId);
  }

  /**
   * Update an existing scope.
   *
   * @param scopeId - ID of the scope to update
   * @param updateScopeDto - Data transfer object containing updated scope details
   * @returns The updated scope
   */
  @Put('scope/:id')
  @ApiOperation({ summary: 'Update an existing scope' })
  @ApiResponse({
    status: 200,
    description: 'The scope has been successfully updated.',
  })
  @ApiResponse({ status: 404, description: 'Scope not found.' })
  async updateScope(
    @Param('id') scopeId: string,
    @Body() updateScopeDto: UpdateScopeDto,
  ): Promise<any> {
    return;

    // this.scopeService.updateScope(scopeId, updateScopeDto);
  }

  /**
   * Retrieve a scope by ID.
   *
   * @param scopeId - ID of the scope to retrieve
   * @returns The requested scope
   */
  @Get('scope/:id')
  @ApiOperation({ summary: 'Retrieve a scope by ID' })
  @ApiResponse({ status: 200, description: 'The requested scope.' })
  @ApiResponse({ status: 404, description: 'Scope not found.' })
  async findScopeById(@Param('id') scopeId: string): Promise<any> {
    return;

    // this.scopeService.findById(scopeId);
  }

  /**
   * Delete a scope by ID.
   *
   * @param scopeId - ID of the scope to delete
   * @returns The deleted scope
   */
  @Delete('scope/:id')
  @ApiOperation({ summary: 'Delete a scope by ID' })
  @ApiResponse({
    status: 200,
    description: 'The scope has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Scope not found.' })
  async deleteScope(@Param('id') scopeId: string): Promise<any> {
    return '';

    //this.scopeService.deleteScope(scopeId);
  }

  @Post(':userId/roles')
  @ApiOperation({ summary: 'Update roles for a user' })
  @ApiParam({ name: 'userId', description: 'The ID of the user', type: String })
  @ApiBody({ type: UpdateUserRolesDto })
  @ApiResponse({
    status: 200,
    description: 'User roles successfully updated.',
  })
  @ApiResponse({ status: 404, description: 'User or Role(s) not found.' })
  async updateUserRoles(
    @Param('userId') userId: string,
    @Body() updateUserRolesDto: UpdateUserRolesDto,
  ) {
    return this.userService.updateUserRoles(userId, updateUserRolesDto.roleIds);
  }
}
