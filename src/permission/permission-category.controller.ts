import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PermissionService } from './permission.service';
import { Authentication } from '@/decorators/auth.decorator';
import { CreatePermissionCategoryDto } from './dto/dto';
import { UpdatePermissionCategoryDto } from './dto/update-permission-category.dto';

@ApiTags('Permission Categories')
@ApiBearerAuth()
@Authentication()
@Controller('permission-categories')
export class PermissionCategoryController {
  constructor(private readonly permissionService: PermissionService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new permission category' })
  @ApiResponse({ status: 201, description: 'Category created successfully' })
  async createCategory(@Body() dto: CreatePermissionCategoryDto) {
    return this.permissionService.createCategory(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all permission categories' })
  @ApiResponse({ status: 200, description: 'Returns all categories' })
  async getAllCategories() {
    return this.permissionService.getAllCategories();
  }

  //   @Get(':id')
  //   @ApiOperation({ summary: 'Get a permission category by ID' })
  //   @ApiResponse({ status: 200, description: 'Returns the category' })
  //   async getCategory(@Param('id', ParseUUIDPipe) id: string) {
  //     return this.permissionService.getCategoryById(id);
  //   }

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
