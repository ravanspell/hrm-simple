import { Controller, Get, Req } from '@nestjs/common';
import { PermissionService } from './permission.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RequestWithTenant } from '@/coretypes';

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
}
