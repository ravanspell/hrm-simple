import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  BadRequestException,
  Req,
  Query
} from '@nestjs/common';
import { FileManagementService } from './file-management.service';
import { UpdateFileManagementDto } from './dto/update-file-management.dto';
import { IsString } from 'class-validator';
import { RequestWithTenant } from 'src/coretypes';
import { RenameFileDto } from './dto/rename-file.dto';

class InitUploadDto {
  @IsString()
  fileName: string;
}

@Controller('file-management')
export class FileManagementController {
  constructor(private readonly fileManagementService: FileManagementService) { }

  @Post('upload/init')
  async initUpload(@Body() initUploadDto: InitUploadDto) {
    const { fileName } = initUploadDto;
    // get the file extention out of the file name
    const splittedFileName = fileName.split('.');
    const fileType = splittedFileName[splittedFileName.length - 1];
    if (!fileName || !fileType) {
      throw new BadRequestException('Filename and fileType are required');
    }
    const { uploadUrl, key } = await this.fileManagementService.getPresignedUrl(fileName, fileType);
    return { uploadUrl, key };
  }

  @Get('organization')
  findAll(
    @Param('page') page: number,
    @Param('pageSize') pageSize: number,
    @Req() req: RequestWithTenant) {
    return this.fileManagementService.findOrganizationAll(req.user.organizationId, page, pageSize);
  }

  // Get combined list of files and folders with pagination
  @Get()
  async listFilesAndFolders(
    @Query('folderId') folderId: string | null,
    @Query('page') page: number = 1, // Default to page 1
    @Query('limit') limit: number = 10, // Default to 10 items per page
    @Req() req: RequestWithTenant
  ) {
    const organizationId = '69fb3a34-1bcc-477d-8a22-99c194ea468d' //req.user.organizationId;
    const skip = (page - 1) * limit;

    // Fetch files, folders, and counts in parallel
    const [files, folders, fileCount, folderCount] = await Promise.all([
      this.fileManagementService.getFiles(folderId, organizationId, skip, limit),
      this.fileManagementService.getFolders(folderId, organizationId, skip, limit),
      this.fileManagementService.getFileCount(folderId, organizationId),
      this.fileManagementService.getFolderCount(folderId, organizationId),
    ]);

    // Combine files and folders into a single array
    const combined = [
      ...files.map(file => ({
        id: file.id,
        name: file.fileName,
        size: file.fileSize,
        key: file.s3ObjectKey,
        uploadedAt: file.uploadedAt,
        folder: false,
      })),
      ...folders.map(folder => ({
        id: folder.id,
        name: folder.name,
        createdAt: folder.createdAt,
        folder: true,
        fileCount: folder._count.files,
        folderCount: folder._count.subFolders,
      })),
    ];

    const totalItems = fileCount + folderCount;
    const totalPages = Math.ceil(totalItems / limit);

    return {
      data: combined,
      pagination: {
        totalItems,
        page,
        limit,
        totalPages,
      },
    };
  }
  /**
   * Renames a specified file.
   * @param id - The ID of the file to rename.
   * @param newName - The new name to assign to the file.
   * @returns Confirmation message or error.
   */
  @Patch('rename-file')
  async renameFile(@Body() renameFileDto: RenameFileDto) {
    const { id, fileName } = renameFileDto;
    await this.fileManagementService.findFileById(id);
    return this.fileManagementService.updateFileName(id, fileName);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.fileManagementService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFileManagementDto: UpdateFileManagementDto) {
    return this.fileManagementService.update(+id, updateFileManagementDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.fileManagementService.remove(+id);
  }
  /**
   * Retrieves the hierarchy of parent folder IDs for breadcrumb navigation.
   * @param folderId - ID of the folder.
   * @returns Array of parent folder IDs from root to the specified folder's parent.
   */
  @Get('breadcrumb/:folderId')
  async getBreadcrumb(@Param('folderId') folderId: string) {
    const parentFolderIds = await this.fileManagementService.getParentFolderIds(folderId);
    return { parentFolderIds };
  }
}
