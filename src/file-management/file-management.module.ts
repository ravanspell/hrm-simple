import { Module } from '@nestjs/common';
import { FileManagementService } from './file-management.service';
import { FileManagementController } from './file-management.controller';
import { AwsS3Service } from './aws-S3.service';

@Module({
  controllers: [FileManagementController],
  providers: [FileManagementService, AwsS3Service],
})
export class FileManagementModule {}
