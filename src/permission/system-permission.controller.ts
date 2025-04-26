import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  ParseUUIDPipe,
  Query,
  HttpStatus,
  Version,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateSystemPermissionDto } from './dto/create-system-permission.dto';
import { UpdateSystemPermissionDto } from './dto/update-system-permission.dto';
import { PermissionService } from './permission.service';
import { CurrentUser } from '@/decorators/current-user.decorator';
import { User } from '@/user/entities/user.entity';
import { SystemPermission } from './entities/system-permission.entity';
import { API_VERSION } from '@/constants/common';
import { Authentication } from '@/decorators/auth.decorator';
import { SystemPermissionResponseDto } from './dto/system-permission-response.dto';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { PaginatedResponseDto } from '@/common/dto/paginated-response.dto';

@ApiTags('System Permissions')
@Controller('system-permissions')
@Authentication()
export class SystemPermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  /**
   * Create a new system permission.
   *
   * @param createSystemPermissionDto - Data transfer object containing permission details
   * @param _user - Current authenticated user
   * @returns The created permission
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
   * Get system permissions with filters
   *
   * @param query - Query parameters for filtering
   * @returns Object containing permissions and pagination metadata
   * @throws BadRequestException if query parameters are invalid
   */
  @Get()
  @Version(API_VERSION.V1)
  @ApiOperation({ summary: 'Get system permissions with filters' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns filtered permissions with pagination metadata',
    type: PaginatedResponseDto<SystemPermissionResponseDto>,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid query parameters provided',
  })
  async getPermissions(
    @Query() query: PaginationDto,
  ): Promise<PaginatedResponseDto<SystemPermissionResponseDto>> {
    return this.permissionService.getSystemPermissions(query);
  }

  /**
   * Update a system permission.
   *
   * @param id - The ID of the permission to update
   * @param dto - Data transfer object containing updated permission details
   * @returns The updated permission
   */
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
