import { Module } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { OrganizationController } from './organization.controller';
import { OrganizationRepository } from 'src/repository/organization.repository';
import { GeneralSettingsService } from './general-settings.service';
import { GeneralSettingsRepository } from '@/repository/general-settings.repository';

@Module({
  controllers: [OrganizationController],
  providers: [
    OrganizationService,
    OrganizationRepository,
    GeneralSettingsService,
    GeneralSettingsRepository,
  ],
  exports: [OrganizationService],
})
export class OrganizationModule {}
