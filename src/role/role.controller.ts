import { Body, Controller, Param, Post, Put, Req, Version } from '@nestjs/common';
import { RoleService } from './role.service';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { CreateRoleDto } from './dto/create-role.dto';
import { RequestWithTenant } from '@/coretypes';
import { UpdateRoleDto } from './dto/update-role.dto';

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
}
