import { Module } from '@nestjs/common';
import { EmailSettingsService } from './email-settings.service';
import { EmailSettingsController } from './email-settings.controller';
import { UtilitiesModule } from 'src/utilities/utilities.module';
import { EmailSettingsRepository } from 'src/repository/email-settings.repository';
import { NotificationService } from '@/notification/notification.service';

@Module({
  imports: [UtilitiesModule],
  controllers: [EmailSettingsController],
  providers: [
    EmailSettingsService,
    EmailSettingsRepository,
    NotificationService,
  ],
  exports: [EmailSettingsService],
})
export class EmailSettingsModule {}
