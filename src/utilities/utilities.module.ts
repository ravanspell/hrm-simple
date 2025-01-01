import { Module } from '@nestjs/common';
import { EncryptionService } from './encryption/encryption.service';
import { AwsS3Service } from './aws-s3-service/aws-S3.service';

@Module({
  providers: [EncryptionService, AwsS3Service],
  exports: [EncryptionService, AwsS3Service],
})
export class UtilitiesModule {}
