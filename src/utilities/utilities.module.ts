import { Module } from '@nestjs/common';
import { EncryptionService } from './encryption/encryption.service';

@Module({
  providers: [EncryptionService],
  exports: [EncryptionService]
})
export class UtilitiesModule {}
