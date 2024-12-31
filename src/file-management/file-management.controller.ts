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
  UnprocessableEntityException,
  NotFoundException,
  Res,
} from '@nestjs/common';
import { FileManagementService } from './file-management.service';
import { UpdateFileManagementDto } from './dto/update-file-management.dto';
import { IsString } from 'class-validator';
import { RequestWithTenant } from 'src/coretypes';
import { RenameFileDto } from './dto/rename-file.dto';
import { RenameFolderDto } from './dto/rename-folder.dto';
import { CreateFolderDto } from './dto/create-folder.dto';
import { DeleteFilesDto } from './dto/delete-files.dto';
import { Response } from 'express';
import * as archiver from 'archiver';

class InitUploadDto {
  @IsString()
  fileName: string;
}

@Controller('file-management')
export class FileManagementController {
  constructor(private readonly fileManagementService: FileManagementService) {}

  @Post('upload/init')
  async initUpload(@Body() initUploadDto: InitUploadDto) {
    const { fileName } = initUploadDto;
    // get the file extention out of the file name
    const splittedFileName = fileName.split('.');
    const fileType = splittedFileName[splittedFileName.length - 1];
    if (!fileName || !fileType) {
      throw new BadRequestException('Filename and fileType are required');
    }
    const { uploadUrl, key } =
      await this.fileManagementService.generateDirtyStorageObjectUploadUrl(
        fileName,
        fileType,
      );
    return { uploadUrl, key };
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
      const parentFolder =
        await this.fileManagementService.findFolderById(parentId);
      path = `${parentFolder.path}/${name}`;
    }
    const folderData = {
      name,
      parentId,
      organizationId: '69fb3a34-1bcc-477d-8a22-99c194ea468d',
      path,
    };
    return this.fileManagementService.createFolder(folderData);
  }
  // Get combined list of files and folders with pagination
  @Get()
  async listFilesAndFolders(
    @Query('folderId') folderId: string | null,
    @Query('page') page: number = 1, // Default to page 1
    @Query('limit') limit: number = 10, // Default to 10 items per page
    @Req() req: RequestWithTenant,
  ) {
    const organizationId = '69fb3a34-1bcc-477d-8a22-99c194ea468d'; //req.user.organizationId;
    const skip = (page - 1) * limit;
    // Fetch files, folders, and counts in parallel
    const [filesWithCount, foldersWithCount] = await Promise.all([
      this.fileManagementService.getFiles(
        folderId,
        organizationId,
        skip,
        limit,
      ),
      this.fileManagementService.getFolders(
        folderId,
        organizationId,
        skip,
        limit,
      ),
    ]);
    const [files, fileCount] = filesWithCount;
    const [folders, folderCount] = foldersWithCount;

    // Combine files and folders into a single array
    const combined = [
      ...folders.map((folder) => ({
        id: folder.id,
        name: folder.name,
        updatedAt: folder.updatedAt,
        folder: true,
        fileCount: folder.fileCount,
        folderCount: folder.subFolderCount,
        updatedBy: `${folder.updater.firstName} ${folder.updater.lastName}`,
        updatedById: folder.updater.id,
      })),
      ...files.map((file) => ({
        id: file.id,
        name: file.fileName,
        size: file.fileSize,
        key: file.s3ObjectKey,
        updatedAt: file.updatedAt,
        folder: false,
        updatedBy: `${file.updater.firstName} ${file.updater.lastName}`,
        updatedById: file.updater.id,
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
  update(
    @Param('id') id: string,
    @Body() updateFileManagementDto: UpdateFileManagementDto,
  ) {
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
      id: { in: ids },
    });
    // collect avaialbe file ids for delete
    const availalbeFilesForDelete = files.map((file) => file.id);
    if (availalbeFilesForDelete.length === 0) {
      throw new UnprocessableEntityException('files not available for delete');
    }
    return this.fileManagementService.softdeleteFiles(
      availalbeFilesForDelete,
      files,
    );
  }
  /**
   * Retrieves the hierarchy of parent folder IDs for breadcrumb navigation.
   * @param folderId - ID of the folder.
   * @returns Array of parent folder IDs from root to the specified folder's parent.
   */
  @Get('breadcrumb/:folderId')
  async getBreadcrumb(@Param('folderId') folderId: string = null) {
    const parentFolderIds =
      await this.fileManagementService.getParentFolderIds(folderId);
    return { parentFolderIds };
  }

  /**
   * Handle download request by determining the type (file, folder, or multiple items).
   * @param ids - Array of file or folder IDs to download.
   * @param res - The response object to stream the download.
   */
  @Get('download')
  async download(@Query('ids') idsString: string, @Res() res: Response) {
    console.log('ids-->', idsString);
    const ids = idsString.split(',');

    // Set response headers to indicate a zip download
    res.setHeader('Content-Disposition', 'attachment; filename=download.zip');
    res.setHeader('Content-Type', 'application/zip'); // Indicate that the response is a zip file
    const archive = archiver('zip');
    archive.pipe(res); // Pipe the archive stream to the response

    // Iterate through each ID to determine if it is a file or folder
    for (const id of ids) {
      // Check if the ID belongs to a file
      const file = await this.fileManagementService.findFileById(id);

      if (file) {
        const s3ObjectStream =
          await this.fileManagementService.getPermentStorageObjectStream(
            file.s3ObjectKey,
          );
        archive.append(s3ObjectStream.Body, { name: file.fileName }); // Append the file to the archive
        continue;
      }
      // Check if the ID belongs to a folder
      const folder = await this.fileManagementService.findFolderById(id);
      if (folder) {
        await this.fileManagementService.addFolderToArchive(folder.id, archive); // Add folder contents to the archive
        continue;
      }

      // Throw exception if neither file nor folder is found
      throw new NotFoundException(`File or Folder with ID ${id} not found`);
    }

    // Finalize the archive (end the stream)
    archive.finalize();
  }

  /**
   * Retrieves the hierarchy of parent folder IDs for breadcrumb navigation.
   * @param folderId - ID of the folder.
   * @returns Array of parent folder IDs from root to the specified folder's parent.
   */
  @Post('upload/confirm')
  async uploadConfirmation(@Body('files') files: string[]) {
    this.fileManagementService.confirmUpload(files);
  }
}
