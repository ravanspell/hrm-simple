import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Put,
  Version,
} from '@nestjs/common';
import { PermissionService } from './permission.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Authentication } from '@/decorators/auth.decorator';
import { API_VERSION } from '@/constants/common';
import { UpdateSystemPermissionDto } from './dto/update-system-permission.dto';
import { CurrentUser } from '@/decorators/current-user.decorator';
import { User } from '@/user/entities/user.entity';

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
