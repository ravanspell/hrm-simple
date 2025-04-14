import { Module } from '@nestjs/common';
import { FileManagementService } from './file-management.service';
import { FileManagementController } from './file-management.controller';
import { AwsS3Service } from '../utilities/aws-s3-service/aws-S3.service';
import { FileMgtRepository } from 'src/repository/file-management.repository';
import { FolderRepository } from 'src/repository/folder.repository';
import { OrganizationModule } from '../organization/organization.module';
import { FileMgtUtilityService } from '../utilities/file-mgt-utility/file-mgt-utility.service';

@Module({
  imports: [OrganizationModule],
  controllers: [FileManagementController],
  providers: [
    FileManagementService,
    AwsS3Service,
    FileMgtRepository,
    FolderRepository,
    FileMgtUtilityService,
  ],
  exports: [FileManagementService],
})
export class FileManagementModule {}
