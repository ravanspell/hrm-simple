import { Module } from '@nestjs/common';
import { EmailStrategy } from './email.strategy';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [EmailStrategy],
  exports: [EmailStrategy],
})
export class EmailModule {}
