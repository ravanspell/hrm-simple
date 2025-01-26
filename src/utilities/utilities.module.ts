import { Module } from '@nestjs/common';
import { EncryptionService } from './encryption/encryption.service';
import { AwsS3Service } from './aws-s3-service/aws-S3.service';
import { CacheService } from './cache/cache.service';
import { AwsSqsService } from './aws-sqs-service/aws-sqs.service';
import { MemoryCacheService } from './cache/memory-cache.service';
import { LoggerService } from './logger/logger.service';
@Module({
  providers: [
    EncryptionService,
    CacheService,
    AwsSqsService,
    AwsS3Service,
    MemoryCacheService,
    LoggerService,
  ],
  exports: [
    EncryptionService,
    CacheService,
    AwsSqsService,
    AwsS3Service,
    LoggerService,
  ],
})
export class UtilitiesModule {}
