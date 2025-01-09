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
} from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GeneralSettings } from './entities/general-settings.entity';
import { GeneralSettingsService } from './general-settings.service';
import { GeneralSettingsDto } from './dto/general-settings.dto';

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
    status: 201,
    description: 'The organization has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
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
  @ApiResponse({ status: 200, description: 'Return all organizations.' })
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
    status: 200,
    description: 'Return the organization with the specified ID.',
  })
  @ApiResponse({ status: 404, description: 'Organization not found.' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    // return this.organizationService.findOne(+id);
  }

  /**
   * Update an organization by ID.
   * @param id - The ID of the organization to update.
   * @param data - The data to update the organization.
   * @returns The updated organization.
   */
  @ApiOperation({ summary: 'Update an organization by ID' })
  @ApiResponse({
    status: 200,
    description: 'The organization has been successfully updated.',
  })
  @ApiResponse({ status: 404, description: 'Organization not found.' })
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
    status: 200,
    description: 'The organization has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Organization not found.' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.organizationService.delete(+id);
  }

  /**
   * Retrieves general settings for a specific organization.
   *
   * @param id - The ID of the organization.
   * @returns The GeneralSettings entity.
   */
  @Get(':id/settings')
  @ApiOperation({ summary: 'Get general settings for an organization' })
  @ApiParam({
    name: 'id',
    description: 'The ID of the organization',
    example: 'b1234567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'General settings retrieved successfully.',
    type: GeneralSettings,
  })
  async getGeneralSettings(@Param('id') id: string): Promise<GeneralSettings> {
    return this.generalSettingsService.getGeneralSettings(id);
  }

  /**
   * Creates general settings for a specific organization.
   *
   * @param id - The ID of the organization.
   * @param generalSettingsDto - The data to create or update general settings.
   * @returns The created GeneralSettings entity.
   */
  @Post(':id/settings')
  @ApiOperation({ summary: 'Create general settings for an organization' })
  @ApiParam({
    name: 'id',
    description: 'The ID of the organization',
    example: 'b1234567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 201,
    description: 'General settings created successfully.',
    type: GeneralSettings,
  })
  async createGeneralSettings(
    @Param('id') id: string,
    @Body() generalSettingsDto: GeneralSettingsDto,
  ): Promise<GeneralSettings> {
    return this.generalSettingsService.createGeneralSettings(
      id,
      generalSettingsDto,
    );
  }

  /**
   * Updates general settings for a specific organization.
   *
   * @param id - The ID of the organization.
   * @param generalSettingsDto - The data to update general settings.
   * @returns The updated GeneralSettings entity.
   */
  @Put(':id/settings')
  @ApiOperation({ summary: 'Update general settings for an organization' })
  @ApiParam({
    name: 'id',
    description: 'The ID of the organization',
    example: 'b1234567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'General settings updated successfully.',
    type: GeneralSettings,
  })
  async updateGeneralSettings(
    @Param('id') id: string,
    @Body() generalSettingsDto: GeneralSettingsDto,
  ): Promise<GeneralSettings> {
    return this.generalSettingsService.updateGeneralSettings(
      id,
      generalSettingsDto,
    );
  }
}
