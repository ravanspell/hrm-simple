import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  ParseUUIDPipe,
  HttpStatus,
  Version,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PermissionService } from './permission.service';
import { Authentication } from '@/decorators/auth.decorator';
import {
  CreatePermissionCategoryDto,
  PermissionCategoryResponseDto,
} from './dto/dto';
import { UpdatePermissionCategoryDto } from './dto/update-permission-category.dto';
import { User } from '@/user/entities/user.entity';
import { CurrentUser } from '@/decorators/current-user.decorator';
import { API_VERSION } from '@/constants/common';

@ApiTags('Permission Categories')
@Controller('permission-categories')
@Authentication()
export class PermissionCategoryController {
  constructor(private readonly permissionService: PermissionService) {}

  @Post()
  @Version(API_VERSION.V1)
  @ApiOperation({ summary: 'Create a new permission category' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Category created successfully',
    type: PermissionCategoryResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data or display order',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Category with this name already exists',
  })
  async createCategory(
    @Body() dto: CreatePermissionCategoryDto,
    @CurrentUser() user: User,
  ): Promise<PermissionCategoryResponseDto> {
    return this.permissionService.createCategory(dto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all permission categories' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Returns all categories' })
  async getAllCategories() {
    return this.permissionService.getAllCategories();
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a permission category' })
  @ApiResponse({ status: 200, description: 'Category updated successfully' })
  async updateCategory(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePermissionCategoryDto,
  ) {
    return this.permissionService.updateCategory(id, dto);
  }
}
