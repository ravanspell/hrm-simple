import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Version,
} from '@nestjs/common';
import { PermissionService } from './permission.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateSystemPermissionDto } from './dto/create-system-permission.dto';
import { Authentication } from '@/decorators/auth.decorator';
import { API_VERSION } from '@/constants/common';
import { UpdateSystemPermissionDto } from './dto/update-system-permission.dto';
import { CurrentUser } from '@/decorators/current-user.decorator';
import { User } from '@/user/entities/user.entity';
import { SystemPermission } from './entities/system-permission.entity';

@ApiTags('User Permissions')
@Controller('permission')
@Authentication()
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Get('user-permissions')
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
   * Create a new system permission.
   *
   * @param createSystemPermissionDto - Data transfer object containing permission details
   * @param _user - Current authenticated user
   * @returns The created permission
   * @throws ConflictException if permission with same key exists
   * @throws BadRequestException if category not found
   */
  @Post()
  @Version(API_VERSION.V1)
  @ApiOperation({ summary: 'Create a new system permission' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The system permission has been successfully created.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data or category not found.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Permission with this key already exists.',
  })
  async createSystemPermission(
    @Body() createSystemPermissionDto: CreateSystemPermissionDto,
    @CurrentUser() user: User,
  ): Promise<SystemPermission> {
    return this.permissionService.createSystemPermission(
      createSystemPermissionDto,
      user.id,
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
