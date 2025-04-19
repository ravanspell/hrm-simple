import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateSystemPermissionDto } from './dto/create-system-permission.dto';
import { PermissionQueryDto } from './dto/dto';
import { UpdateSystemPermissionDto } from './dto/update-system-permission.dto';
import { PermissionService } from './permission.service';
import { CurrentUser } from '@/decorators/current-user.decorator';
import { User } from '@/user/entities/user.entity';

@ApiTags('System Permissions')
@Controller('system-permissions')
export class SystemPermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new system permission' })
  @ApiResponse({ status: 201, description: 'Permission created successfully' })
  async createPermission(
    @Body() dto: CreateSystemPermissionDto,
    @CurrentUser() user: User,
  ) {
    return this.permissionService.createSystemPermission(dto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get system permissions with filters' })
  @ApiResponse({ status: 200, description: 'Returns filtered permissions' })
  async getPermissions(@Query() query: PermissionQueryDto) {
    return this.permissionService.getSystemPermissions(query);
  }

  // @Get(':id')
  // @ApiOperation({ summary: 'Get a system permission by ID' })
  // @ApiResponse({ status: 200, description: 'Returns the permission' })
  // async getPermission(@Param('id', ParseUUIDPipe) id: string) {
  //     return this.permissionService.getSystemPermissionById(id);
  // }

  @Put(':id')
  @ApiOperation({ summary: 'Update a system permission' })
  @ApiResponse({ status: 200, description: 'Permission updated successfully' })
  async updatePermission(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSystemPermissionDto,
  ) {
    return this.permissionService.updateSystemPermission(id, dto);
  }
}
