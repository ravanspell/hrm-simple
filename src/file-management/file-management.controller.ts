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
  Query,
  NotFoundException,
  UnprocessableEntityException
} from '@nestjs/common';
import { FileManagementService } from './file-management.service';
import { UpdateFileManagementDto } from './dto/update-file-management.dto';
import { IsString } from 'class-validator';
import { RequestWithTenant } from 'src/coretypes';
import { RenameFileDto } from './dto/rename-file.dto';
import { RenameFolderDto } from './dto/rename-folder.dto';
import { CreateFolderDto } from './dto/create-folder.dto';
import { DeleteFilesDto } from './dto/delete-files.dto';

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

  /**
   * Endpoint to create a new folder.
   * @param createFolderDto - DTO containing the new folder's name, organization, and optional parent ID.
   * @returns The created folder record.
   */
  @Post('create-folder')
  async createFolder(@Body() createFolderDto: CreateFolderDto) {
    const { parentId, name } = createFolderDto;
    let path = `/${name}`;
    // Determine the path based on parent folder (if any)
    if (parentId) {
      const parentFolder = await this.fileManagementService.findFolderById(parentId);
      path = `${parentFolder.path}/${name}`;
    }
    const folderData = {
      name,
      parentId,
      organizationId: '69fb3a34-1bcc-477d-8a22-99c194ea468d',
      path,
    }
    return this.fileManagementService.createFolder(folderData);
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
      ...folders.map(folder => ({
        id: folder.id,
        name: folder.name,
        createdAt: folder.createdAt,
        folder: true,
        fileCount: folder._count.files,
        folderCount: folder._count.subFolders,
      })),
      ...files.map(file => ({
        id: file.id,
        name: file.fileName,
        size: file.fileSize,
        key: file.s3ObjectKey,
        uploadedAt: file.uploadedAt,
        folder: false,
      })),
    ];

    const totalItems = fileCount + folderCount;
    const totalPages = Math.ceil(totalItems / limit);

    return {
      filesAndFolders: combined,
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
  /**
  * Endpoint to rename a specified folder with validation.
  * @param renameFolderDto - DTO containing the folder ID and the new validated name.
  * @returns Confirmation message.
  */
  @Patch('rename-folder')
  async renameFolder(@Body() renameFolderDto: RenameFolderDto) {
    const { id, folderName } = renameFolderDto;
    await this.fileManagementService.findFolderById(id);
    return this.fileManagementService.updateFolderName(id, folderName);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.fileManagementService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFileManagementDto: UpdateFileManagementDto) {
    return this.fileManagementService.update(+id, updateFileManagementDto);
  }

  /**
    * Endpoint to delete multiple files or a single file based on file IDs.
    * @param deleteFilesDto - DTO containing an array of file IDs to delete.
    * @returns Confirmation message of the deletion.
    */
  @Delete('soft-delete-files')
  async deleteFiles(@Body() deleteFilesDto: DeleteFilesDto) {
    const { ids } = deleteFilesDto;
    const files = await this.fileManagementService.findFiles({
      id: { in: ids }},
    );
    // collect avaialbe file ids for delete
    const availalbeFilesForDelete = files.map(file => file.id);
    if (availalbeFilesForDelete.length === 0) {
      throw new UnprocessableEntityException('files not available for delete');
    }
    return this.fileManagementService.softdeleteFiles(availalbeFilesForDelete, files);
  }
  /**
   * Retrieves the hierarchy of parent folder IDs for breadcrumb navigation.
   * @param folderId - ID of the folder.
   * @returns Array of parent folder IDs from root to the specified folder's parent.
   */
  @Get('breadcrumb/:folderId')
  async getBreadcrumb(@Param('folderId') folderId: string = null) {
    const parentFolderIds = await this.fileManagementService.getParentFolderIds(folderId);
    return { parentFolderIds };
  }
}
