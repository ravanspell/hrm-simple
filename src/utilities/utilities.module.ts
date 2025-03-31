import { Module } from '@nestjs/common';
import { EncryptionService } from './encryption/encryption.service';
import { AwsS3Service } from './aws-s3-service/aws-S3.service';
import { CacheService } from './cache/cache.service';
import { AwsSqsService } from './aws-sqs-service/aws-sqs.service';
import { MemoryCacheService } from './cache/memory-cache.service';
import { TurnstileService } from './turnstile-service/turnstile-service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [
    EncryptionService,
    CacheService,
    AwsSqsService,
    AwsS3Service,
    MemoryCacheService,
    TurnstileService,
  ],
  exports: [
    EncryptionService,
    CacheService,
    AwsSqsService,
    AwsS3Service,
    TurnstileService,
  ],
})
export class UtilitiesModule {}
