import { Module } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { OrganizationController } from './organization.controller';
import { OrganizationRepository } from 'src/repository/organization.repository';
import { GeneralSettingsService } from './general-settings.service';
import { GeneralSettingsRepository } from '@/repository/general-settings.repository';
import { OrganizationStorageService } from './organization-storage.service';
import { FileMgtUtilityService } from '../utilities/file-mgt-utility/file-mgt-utility.service';

@Module({
  controllers: [OrganizationController],
  providers: [
    OrganizationService,
    OrganizationRepository,
    GeneralSettingsService,
    GeneralSettingsRepository,
    OrganizationStorageService,
    FileMgtUtilityService,
  ],
  exports: [OrganizationService, OrganizationStorageService],
})
export class OrganizationModule {}
