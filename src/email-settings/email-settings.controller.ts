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

@Controller('email-settings')
export class EmailSettingsController {
  constructor(private readonly emailSettingsService: EmailSettingsService) {}

  @Post()
  @Version('1')
  @Authentication()
  // @UseGuards(AuthGuard)
  create(@Body() createDto: CreateEmailSettingsDto, @Req() req: RequestWithTenant) {
    const createEmailSettingsData = {
      ...createDto,
      organizationId: req.user.organizationId,
    };
    return this.emailSettingsService.create(createEmailSettingsData);
  }

  @Get('organization/:orgId')
  @Version('1')
  // @UseGuards(AuthGuard)
  findAllByOrganization(@Param('orgId') orgId: string) {
    return this.emailSettingsService.findAllByOrganization(orgId);
  }

  @Get('primary/organization/:orgId')
  @Version('1')
  // @UseGuards(AuthGuard)
  findPrimaryByOrganization(@Param('orgId') orgId: string) {
    return this.emailSettingsService.findPrimaryEmailSettings(orgId);
  }

  @Patch(':id')
  @Version('1')
  // @UseGuards(AuthGuard)
  update(@Param('id') id: string, @Body() updateDto: UpdateEmailSettingDto) {
    return this.emailSettingsService.update(id, updateDto);
  }

  @Delete(':id')
  @Version('1')
  // @UseGuards(AuthGuard)
  remove(@Param('id') id: string) {
    return this.emailSettingsService.remove(id);
  }
}
