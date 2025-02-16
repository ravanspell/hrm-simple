import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Version,
  Req,
} from '@nestjs/common';
import { EmailSettingsService } from './email-settings.service';
import { CreateEmailSettingsDto } from './dto/create-email-setting.dto';
import { UpdateEmailSettingDto } from './dto/update-email-setting.dto';
import { Authentication } from 'src/decorators/auth.decorator';
import { RequestWithTenant } from 'src/coretypes';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { NotificationService } from '@/notification/notification.service';
import { NOTIFICATION_TYPE } from '@/constants/notifications';

@ApiTags('email-settings')
@Controller('email-settings')
export class EmailSettingsController {
  constructor(
    private readonly emailSettingsService: EmailSettingsService,
    private readonly notificationService: NotificationService,
  ) {}

  /**
   * Creates new email settings.
   * @param createDto - The DTO containing the email settings to create.
   * @param req - The request object containing tenant information.
   * @returns The created email settings.
   */
  @Post()
  @Version('1')
  @Authentication()
  @ApiOperation({ summary: 'Create email settings' })
  @ApiResponse({
    status: 201,
    description: 'The email settings have been successfully created.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  create(
    @Body() createDto: CreateEmailSettingsDto,
    @Req() req: RequestWithTenant,
  ) {
    console.log('req.user-->', req.user);
    const createEmailSettingsData = {
      ...createDto,
      organizationId: req.user.organizationId,
    };
    return this.emailSettingsService.create(createEmailSettingsData);
  }

  /**
   * Get all email settings for the organization
   * @param req user's organizationId
   * @returns all email settings for the organization
   */
  @Get()
  @Version('1')
  @Authentication()
  async findAllByOrganization(@Req() req: RequestWithTenant) {
    const webPush = {
      userId: req?.user.id,
      subject: 'this is test notification',
      body: '',
    };
    const email = {
      body: '',
      templateId: '',
      subject: '',
      userId: '',
    };
    console.log('req?.user?.organizationId--->', req?.user);

    await this.notificationService.publishNotification(
      NOTIFICATION_TYPE.WEB_PUSH,
      webPush,
    );
    return this.emailSettingsService.findAllByOrganization(
      req?.user?.organizationId,
    );
  }

  /**
   * Get primary email settings for the organization
   * @param orgId user's organizationId
   * @returns organization's primary email settings
   */
  @Get('primary/organization/:orgId')
  @Version('1')
  @Authentication()
  findPrimaryByOrganization(@Param('orgId') orgId: string) {
    return this.emailSettingsService.getPrimaryEmailSettings(orgId);
  }

  /**
   * Updates email settings by ID.
   * @param id - The ID of the email settings to update.
   * @param updateDto - The DTO containing the updated email settings.
   * @returns The updated email settings.
   */
  @Patch(':id')
  @Version('1')
  @Authentication()
  @ApiOperation({ summary: 'Update email settings by ID' })
  @ApiResponse({
    status: 200,
    description: 'The email settings have been successfully updated.',
  })
  @ApiResponse({ status: 404, description: 'Email settings not found.' })
  update(@Param('id') id: string, @Body() updateDto: UpdateEmailSettingDto) {
    return this.emailSettingsService.update(id, updateDto);
  }

  /**
   * Deletes email settings by ID.
   * @param id - The ID of the email settings to delete.
   * @returns The result of the deletion.
   */
  @Delete(':id')
  @Version('1')
  @Authentication()
  @ApiOperation({ summary: 'Delete email settings by ID' })
  @ApiResponse({
    status: 200,
    description: 'The email settings have been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Email settings not found.' })
  remove(@Param('id') id: string) {
    return '';

    //this.emailSettingsService.remove(id);
  }
}
