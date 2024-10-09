import { Module } from '@nestjs/common';
import { EmailSettingsService } from './email-settings.service';
import { EmailSettingsController } from './email-settings.controller';
import { UtilitiesModule } from 'src/utilities/utilities.module';

@Module({
  imports: [UtilitiesModule],
  controllers: [EmailSettingsController],
  providers: [EmailSettingsService],
  exports: [EmailSettingsService],
})
export class EmailSettingsModule {}
