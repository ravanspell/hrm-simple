import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { EmailSettingsService } from './email-settings.service';
import { CreateEmailSettingsDto } from './dto/create-email-setting.dto';
import { UpdateEmailSettingDto } from './dto/update-email-setting.dto';

@Controller('email-settings')
export class EmailSettingsController {
  constructor(private readonly emailSettingsService: EmailSettingsService) {}

  @Post()
  // @UseGuards(AuthGuard)
  create(@Body() createDto: CreateEmailSettingsDto) {
    return this.emailSettingsService.create(createDto);
  }

  @Get('organization/:orgId')
  // @UseGuards(AuthGuard)
  findAllByOrganization(@Param('orgId') orgId: string) {
    return this.emailSettingsService.findAllByOrganization(orgId);
  }

  @Get('primary/organization/:orgId')
  // @UseGuards(AuthGuard)
  findPrimaryByOrganization(@Param('orgId') orgId: string) {
    return this.emailSettingsService.findPrimaryByOrganization(orgId);
  }

  @Patch(':id')
  // @UseGuards(AuthGuard)
  update(@Param('id') id: string, @Body() updateDto: UpdateEmailSettingDto) {
    return this.emailSettingsService.update(id, updateDto);
  }

  @Delete(':id')
  // @UseGuards(AuthGuard)
  remove(@Param('id') id: string) {
    return this.emailSettingsService.remove(id);
  }
}
