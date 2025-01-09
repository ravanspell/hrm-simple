import { Module } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { OrganizationController } from './organization.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organization } from '@/organization/entities/organization.entity';
import { OrganizationRepository } from 'src/repository/organization.repository';
import { GeneralSettingsService } from './general-settings.service';
import { GeneralSettingsRepository } from '@/repository/general-settings.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Organization])],
  controllers: [OrganizationController],
  providers: [
    OrganizationService,
    OrganizationRepository,
    GeneralSettingsService,
    GeneralSettingsRepository,
  ],
})
export class OrganizationModule {}
