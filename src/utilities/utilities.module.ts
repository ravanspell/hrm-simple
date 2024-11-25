import { Module } from '@nestjs/common';
import { EncryptionService } from './encryption/encryption.service';
import { CacheService } from './cache/cache.service';

@Module({
  providers: [EncryptionService, CacheService],
  exports: [EncryptionService, CacheService],
})
export class UtilitiesModule {}
