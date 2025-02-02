import { Body, Controller, Get, Post, Req, Version } from '@nestjs/common';
import { PermissionService } from './permission.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RequestWithTenant } from '@/coretypes';
import { CreateSystemPermissionDto } from './dto/create-system-permission.dto';
import { Authentication } from '@/decorators/auth.decorator';
import { API_VERSION } from '@/constants/common';

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
  @ApiOperation({ summary: 'Create a new system permission' })
  @Authentication()
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
    return this.permissionService.createSystemPermission({...createSystemPermissionDto, createdBy: createdById});
  }
}
