import { Module } from '@nestjs/common';
import { FileManagementService } from './file-management.service';
import { FileManagementController } from './file-management.controller';
import { AwsS3Service } from './aws-S3.service';
import { FileMgtRepository } from 'src/repository/file-management.repository';
import { FolderRepository } from 'src/repository/folder.repository';

@Module({
  controllers: [FileManagementController],
  providers: [FileManagementService, AwsS3Service, FileMgtRepository, FolderRepository],
})
export class FileManagementModule {}
