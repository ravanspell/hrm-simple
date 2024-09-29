import { Module } from '@nestjs/common';
import { FileManagementService } from './file-management.service';
import { FileManagementController } from './file-management.controller';

@Module({
  controllers: [FileManagementController],
  providers: [FileManagementService],
})
export class FileManagementModule {}
