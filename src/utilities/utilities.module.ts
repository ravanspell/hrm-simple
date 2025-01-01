import { Module } from '@nestjs/common';
import { EncryptionService } from './encryption/encryption.service';
import { CacheService } from './cache/cache.service';
import { AwsSqsService } from './aws-sqs-service/aws-sqs.service';

@Module({
  providers: [EncryptionService, CacheService, AwsSqsService],
  exports: [EncryptionService, CacheService, AwsSqsService],
})
export class UtilitiesModule {}
