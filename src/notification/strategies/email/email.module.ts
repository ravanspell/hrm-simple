import { Module } from '@nestjs/common';
import { EmailStrategy } from './email.strategy';
import { EmailSettingsModule } from 'src/email-settings/email-settings.module';

@Module({
  imports: [EmailSettingsModule],
  providers: [EmailStrategy],
  exports: [EmailStrategy],
})
export class EmailModule {}
