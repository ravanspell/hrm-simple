import { Module } from '@nestjs/common';
import { EncryptionService } from './encryption/encryption.service';
import { AwsS3Service } from './aws-s3-service/aws-S3.service';
import { CacheService } from './cache/cache.service';
import { AwsSqsService } from './aws-sqs-service/aws-sqs.service';
import { MemoryCacheService } from './cache/memory-cache.service';
import { TurnstileService } from './turnstile-service/turnstile-service';
import { HttpModule } from '@nestjs/axios';
import { SentryService } from './sentry/sentry.service';
import { CommonUtilitiesService } from './environment/common.utilities.service';
import { FileMgtUtilityService } from './file-mgt-utility/file-mgt-utility.service';
@Module({
  imports: [HttpModule],
  providers: [
    EncryptionService,
    CacheService,
    AwsSqsService,
    AwsS3Service,
    MemoryCacheService,
    TurnstileService,
    SentryService,
    CommonUtilitiesService,
    FileMgtUtilityService,
  ],
  exports: [
    EncryptionService,
    CacheService,
    AwsSqsService,
    AwsS3Service,
    TurnstileService,
    SentryService,
    CommonUtilitiesService,
    FileMgtUtilityService,
  ],
})
export class UtilitiesModule {}
