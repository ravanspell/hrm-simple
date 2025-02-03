import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Req,
  Version,
} from '@nestjs/common';
import { PermissionService } from './permission.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RequestWithTenant } from '@/coretypes';
import { CreateSystemPermissionDto } from './dto/create-system-permission.dto';
import { Authentication } from '@/decorators/auth.decorator';
import { API_VERSION } from '@/constants/common';
import { UpdateSystemPermissionDto } from './dto/update-system-permission.dto';

ApiTags('User Permissions');
@Controller('permission')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Get('user-permissions')
  @ApiOperation({ summary: 'Get system permissions with filters' })
  @ApiResponse({ status: 200, description: 'Returns filtered permissions' })
  async getPermissions(@Req() req: RequestWithTenant) {
    const userId = req.user.id;
    return this.permissionService.getUserEffectivePermissions(userId);
  }

  /**
   * Create a new system permission.
   *
   * @param CreateSystemPermissionDto - Data transfer object containing permission details
   * @returns The created permission
   */
  @Post()
  @Authentication()
  @ApiOperation({ summary: 'Create a new system permission' })
  @ApiResponse({
    status: 201,
    description: 'The system permission has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @Version(API_VERSION.V1)
  async createSystemPermission(
    @Body() createSystemPermissionDto: CreateSystemPermissionDto,
    @Req() request: RequestWithTenant,
  ): Promise<any> {
    const createdById = request.user.id;
    return this.permissionService.createSystemPermission({
      ...createSystemPermissionDto,
      createdBy: createdById,
    });
  }

  /**
   * Update an existing permission.
   *
   * @param permissionId - ID of the permission to update
   * @param updatePermissionReqBody - Data transfer object containing updated permission details
   * @returns The updated permission
   */
  @Put('/:id')
  @Authentication()
  @ApiOperation({ summary: 'Update an existing permission' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The permission has been successfully updated.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Permission not found.',
  })
  @Version(API_VERSION.V1)
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
