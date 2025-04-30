import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Put,
  Version,
  Query,
} from '@nestjs/common';
import { PermissionService } from './permission.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Authentication } from '@/decorators/auth.decorator';
import { API_VERSION } from '@/constants/common';
import { UpdateSystemPermissionDto } from './dto/update-system-permission.dto';
import { CurrentUser } from '@/decorators/current-user.decorator';
import { User } from '@/user/entities/user.entity';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { PaginatedResponseDto } from '@/common/dto/paginated-response.dto';
import { SystemPermissionResponseDto } from './dto/system-permission-response.dto';
import { ParseUUIDPipe } from '@nestjs/common';

@ApiTags('User Permissions')
@Controller('permission')
@Authentication()
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Get()
  @Version(API_VERSION.V1)
  @ApiOperation({ summary: 'Get system permissions with filters' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns filtered permissions',
  })
  async getPermissions(@CurrentUser() user: User) {
    const userId = user.id;
    return this.permissionService.getUserEffectivePermissions(userId);
  }

  /**
   * Get all permissions licensed to an organization (for super admin)
   * @param organizationId Organization ID
   * @returns Array of permission IDs
   */
  @Get('organization/:organizationId/licensed')
  @Version(API_VERSION.V1)
  @ApiOperation({ summary: 'Get all permissions licensed to an organization' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns array of permission IDs licensed to the organization',
  })
  async getOrganizationLicensedPermissions(
    @Param('organizationId', ParseUUIDPipe) organizationId: string,
  ): Promise<string[]> {
    return this.permissionService.getOrganizationLicensedPermissions(
      organizationId,
    );
  }

  /**
   * Get all permissions assigned to roles in current user's organization
   * @param query Pagination parameters
   * @param user Current authenticated user
   * @returns Object containing grouped permissions and pagination metadata
   */
  @Get('organization/role-permissions')
  @Version(API_VERSION.V1)
  @ApiOperation({
    summary: 'Get all permissions assigned to roles in organization',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description:
      'Returns grouped permissions assigned to roles in organization',
    type: PaginatedResponseDto<SystemPermissionResponseDto>,
  })
  async getOrganizationRolePermissions(
    @Query() query: PaginationDto,
    @CurrentUser() user: User,
  ): Promise<PaginatedResponseDto<SystemPermissionResponseDto>> {
    return this.permissionService.getOrganizationRolePermissions(
      user.organizationId,
      query,
    );
  }

  /**
   * Update an existing permission.
   *
   * @param permissionId - ID of the permission to update
   * @param updatePermissionReqBody - Data transfer object containing updated permission details
   * @returns The updated permission
   */
  @Put('/:id')
  @Version(API_VERSION.V1)
  @ApiOperation({ summary: 'Update an existing permission' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The permission has been successfully updated.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Permission not found.',
  })
  async updatePermission(
    @Param('id') permissionId: string,
    @Body() updatePermissionReqBody: UpdateSystemPermissionDto,
  ): Promise<any> {
    return this.permissionService.updateSystemPermission(
      permissionId,
      updatePermissionReqBody,
    );
  }
}
