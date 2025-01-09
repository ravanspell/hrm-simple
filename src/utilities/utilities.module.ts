import { Module } from '@nestjs/common';
import { EncryptionService } from './encryption/encryption.service';
import { AwsS3Service } from './aws-s3-service/aws-S3.service';
import { CacheService } from './cache/cache.service';
import { AwsSqsService } from './aws-sqs-service/aws-sqs.service';
import { MemoryCacheService } from './cache/memory-cache.service';
@Module({
  providers: [
    EncryptionService,
    CacheService,
    AwsSqsService,
    AwsS3Service,
    MemoryCacheService,
  ],
  exports: [EncryptionService, CacheService, AwsSqsService, AwsS3Service],
})
export class UtilitiesModule {}
