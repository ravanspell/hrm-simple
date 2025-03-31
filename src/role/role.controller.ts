import {
  Body,
  Controller,
  HttpStatus,
  Param,
  Post,
  Put,
  Req,
  Version,
} from '@nestjs/common';
import { RoleService } from './role.service';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { CreateRoleRequest } from './dto/create-role.dto';
import { RequestWithTenant } from '@/coretypes';
import { UpdateRoleRequest } from './dto/update-role.dto';
import { API_VERSION } from '@/constants/common';

@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  // @Post(':userId/roles')
  // @ApiOperation({ summary: 'Update roles for a user' })
  // @ApiParam({ name: 'userId', description: 'The ID of the user', type: String })
  // @ApiBody({ type: UpdateUserRolesDto })
  // @ApiResponse({
  //   status: 200,
  //   description: 'User roles successfully updated.',
  // })
  // @ApiResponse({ status: 404, description: 'User or Role(s) not found.' })
  // @Authentication()
  // @Permissions(EDIT_ROLE)
  // async updateUserRoles(
  //   @Param('userId') userId: string,
  //   @Body() updateUserRolesDto: UpdateUserRolesDto,
  // ) {
  //   return this.userService.updateUserRoles(userId, updateUserRolesDto.roleIds);
  // }

  /**
   * Create a new role.
   * @param createRoleData Data to create the role.
   */
  @Post()
  @Version(API_VERSION.V1)
  @ApiOperation({ summary: 'Create a new role' })
  @ApiBody({ type: CreateRoleRequest })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Role successfully created',
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request' })
  createRole(
    @Body() createRoleData: CreateRoleRequest,
    @Req() requestWithTenant: RequestWithTenant,
  ) {
    const organizationId = requestWithTenant.organization.id;
    this.roleService.createRole(createRoleData, organizationId);
  }

  /**
   * Update an existing role by its ID.
   * @param id Role ID.
   * @param updateRoleData Data to update the role.
   */
  @Put('/:id')
  @Version(API_VERSION.V1)
  @ApiOperation({ summary: 'Update a role by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Role ID' })
  @ApiBody({ type: UpdateRoleRequest })
  @ApiResponse({ status: 200, description: 'Role successfully updated' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  updateRole(
    @Param('id') id: string,
    @Body() updateRoleData: UpdateRoleRequest,
  ) {
    console.log('updateRole-->', id, updateRoleData);
    return id;
    // this.roleService.updateRole(id, updateRoleData);
  }
}
