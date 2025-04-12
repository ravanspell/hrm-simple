import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Put,
  Req,
  HttpStatus,
  Version,
} from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GeneralSettings } from './entities/general-settings.entity';
import { GeneralSettingsService } from './general-settings.service';
import { GeneralSettingsDto } from './dto/general-settings.dto';
import { StorageInfoResponseDto } from './dto/storage-info-response.dto';
import { RequestWithTenant } from '@/coretypes';
import { Authentication } from '@/decorators/auth.decorator';
import { API_VERSION } from '@/constants/common';

@ApiTags('organizations')
@Controller('organization')
export class OrganizationController {
  constructor(
    private readonly organizationService: OrganizationService,
    private readonly generalSettingsService: GeneralSettingsService,
  ) {}

  /**
   * Create a new organization.
   * @param data - The data to create a new organization.
   * @returns The created organization.
   */
  @ApiOperation({ summary: 'Create a new organization' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The organization has been successfully created.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad Request.',
  })
  @Post()
  async create(@Body() createOrganizationDto: CreateOrganizationDto) {
    console.log('this is operated');

    return await this.organizationService.create(createOrganizationDto);
  }

  /**
   * Get all organizations.
   * @returns A list of all organizations.
   */
  @ApiOperation({ summary: 'Get all organizations' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Return all organizations.',
  })
  @Get()
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return await this.organizationService.getAllOrganizations(page, limit);
  }

  /**
   * Get an organization by ID.
   * @param id - The ID of the organization to retrieve.
   * @returns The organization with the specified ID.
   */
  @ApiOperation({ summary: 'Get an organization by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Return the organization with the specified ID.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Organization not found.',
  })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return id;
  }

  /**
   * Update an organization by ID.
   * @param id - The ID of the organization to update.
   * @param data - The data to update the organization.
   * @returns The updated organization.
   */
  @ApiOperation({ summary: 'Update an organization by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The organization has been successfully updated.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Organization not found.',
  })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateOrganizationDto: UpdateOrganizationDto,
  ) {
    return this.organizationService.update(+id, updateOrganizationDto);
  }

  /**
   * Delete an organization by ID.
   * @param id - The ID of the organization to delete.
   * @returns The deleted organization.
   */
  @ApiOperation({ summary: 'Delete an organization by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The organization has been successfully deleted.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Organization not found.',
  })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.organizationService.delete(+id);
  }

  /**
   * Retrieves general settings for a specific organization.
   *
   * @returns The GeneralSettings entity.
   */
  @Get('/settings')
  @ApiOperation({ summary: 'Get general settings for an organization' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'General settings retrieved successfully.',
    type: GeneralSettings,
  })
  async getGeneralSettings(): Promise<GeneralSettings> {
    const organizationId = '';
    return this.generalSettingsService.getGeneralSettings(organizationId);
  }

  /**
   * Creates general settings for a specific organization.
   *
   * @param generalSettingsDto - The data to create or update general settings.
   * @returns The created GeneralSettings entity.
   */
  @Post('/settings')
  @ApiOperation({ summary: 'Create general settings for an organization' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'General settings created successfully.',
    type: GeneralSettings,
  })
  async createGeneralSettings(
    @Body() generalSettingsDto: GeneralSettingsDto,
  ): Promise<GeneralSettings> {
    const organizationId = '';
    return this.generalSettingsService.createGeneralSettings(
      organizationId,
      generalSettingsDto,
    );
  }

  /**
   * Updates general settings for a specific organization.
   *
   * @param generalSettingsDto - The data to update general settings.
   * @returns The updated GeneralSettings entity.
   */
  @Put('/settings')
  @ApiOperation({ summary: 'Update general settings for an organization' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'General settings updated successfully.',
    type: GeneralSettings,
  })
  async updateGeneralSettings(
    @Body() generalSettingsDto: GeneralSettingsDto,
  ): Promise<GeneralSettings> {
    const organizationId = '';
    return this.generalSettingsService.updateGeneralSettings(
      organizationId,
      generalSettingsDto,
    );
  }

  /**
   * Get storage information for an organization.
   * @param id - The ID of the organization.
   * @returns Storage information including allocated, used, and percentage.
   */
  @Get('/storage')
  @Authentication()
  @Version(API_VERSION.V1)
  @ApiOperation({ summary: 'Get storage information for an organization' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns storage information for the organization',
    type: StorageInfoResponseDto,
  })
  async getStorageInfo(
    @Req() req: RequestWithTenant,
  ): Promise<StorageInfoResponseDto> {
    const organizationId = req.user.organizationId;
    return this.organizationService.getStorageInfo(organizationId);
  }
}
