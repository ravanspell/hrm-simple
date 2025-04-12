import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateFileManagementDto } from './dto/update-file-management.dto';
import { ConfigService } from '@nestjs/config';
import {
  GetObjectCommandOutput,
  HeadObjectCommandOutput,
  Tag,
} from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import * as archiver from 'archiver';
import { FILE_STATUSES } from './constants';
import { AwsS3Service } from '../utilities/aws-s3-service/aws-S3.service';
import { FileMgtRepository } from 'src/repository/file-management.repository';
import { FolderRepository } from 'src/repository/folder.repository';
import { Transactional } from 'typeorm-transactional';
import { Folder } from './entities/folder.entity';
import { FileMgt } from './entities/file-management.entity';
import { OrganizationService } from '../organization/organization.service';

interface TaggingResult {
  status: 'fulfilled' | 'rejected';
  key: string;
  error?: Error;
}

export interface createFileData {
  fileName: string;
  parentId?: string | null;
  s3ObjectKey: string;
  fileSize: number;
}

@Injectable()
export class FileManagementService {
  private dirtyBucket: string;
  private permanentBucket: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly awsS3Service: AwsS3Service,
    private readonly fileMgtRepository: FileMgtRepository,
    private readonly folderRepository: FolderRepository,
    private readonly organizationService: OrganizationService,
  ) {
    this.dirtyBucket = this.configService.get<string>('DIRTY_BUCKET_NAME');
    this.permanentBucket = this.configService.get<string>(
      'PERMANENT_BUCKET_NAME',
    );
  }
  /**
   * Checks if a file exists by its ID.
   * @param id - The ID of the file.
   * @returns The file record if it exists.
   * @throws NotFoundException if the file does not exist.
   */
  async findFileById(id: string) {
    const file = await this.fileMgtRepository.getFileById(id);
    if (!file) {
      throw new NotFoundException(`Specified file not found`);
    }
    return file;
  }
  /**
   * Checks if a file exists by its ID.
   * @param id - The ID of the file.
   * @returns The file record if it exists.
   * @throws NotFoundException if the file does not exist.
   */
  async findFolderById(id: string) {
    const file = await this.folderRepository.getFolderById(id);
    if (!file) {
      throw new NotFoundException(`Specified folder not found`);
    }
    return file;
  }
  /**
   * Updates the name of a folder.
   * @param id - The ID of the folder.
   * @param folderName - The new fodler name to set.
   * @returns Success message indicating the folder name was updated.
   */
  async updateFolderName(id: string, folderName: string) {
    // check for the folder existence
    await this.findFolderById(id);
    await this.folderRepository.updateFolder(id, { name: folderName });
    return { message: `Folder renamed to ${folderName} successfully.` };
  }

  /**
   * Generates a presigned URL for uploading a file to the dirty bucket.
   *
   * @param filename - uploading file name.
   * @param fileType - file extension of the file.
   * @returns upload url and key
   */
  async generateDirtyStorageObjectUploadUrl(
    filename: string,
    fileType: string,
  ): Promise<{ uploadUrl: string; key: string }> {
    const key = `${uuidv4()}_${filename}`;
    const uploadUrl = await this.awsS3Service.generateUploadPreSignedUrl(
      this.dirtyBucket,
      key,
      fileType,
    );
    return { uploadUrl, key };
  }

  /**
   * Confirms the existence of a file in the dirty bucket, copies it to the permanent bucket,
   *
   * @param fileKey - The key (path) of the file in the S3 bucket.
   * @returns A promise that resolves to true if successful, false otherwise.
   */
  async copyFileToMainStorage(fileKey: string): Promise<boolean> {
    // Copy the file to the permanent bucket
    await this.awsS3Service.copyObject(
      this.dirtyBucket,
      this.permanentBucket,
      fileKey,
      fileKey,
    );
    console.log(`Copied '${fileKey}' to '${this.permanentBucket}'.`);
    return true;
  }

  /**
   * Generates a presigned URL for downloading a file from the permanent bucket.
   * @param fileKey - The key (path) of the file in the S3 bucket.
   * @param expiresIn - Time in seconds for the presigned URL to remain valid.
   * @returns Presigned URL as a string.
   */
  async generateMainStorageObjectDownloadUrl(
    fileKey: string,
    expiresIn: number = 3600,
  ): Promise<string> {
    const url = await this.awsS3Service.generateDownloadPresignedUrl(
      this.permanentBucket,
      fileKey,
      expiresIn,
    );
    return url;
  }

  findOne(id: number) {
    return `This action returns a #${id} fileManagement`;
  }

  update(id: number, updateFileManagementDto: UpdateFileManagementDto) {
    return `This action updates a #${id} fileManagement ${updateFileManagementDto}`;
  }

  /**
   * Deletes multiple files based on an array of file IDs.
   * @param ids - Array of file IDs to delete.
   * @param files - Array of file data to update status.
   * @returns
   */
  @Transactional()
  async softdeleteFiles(ids: string[], files: FileMgt[]) {
    const fileIds = files.map((file) => file.id);
    await this.fileMgtRepository.softDeleteFiles(fileIds);

    const fileS3ObjectKeys = files.map((file) => file.s3ObjectKey);

    // tag to be deleted the file object in the storage
    // Leveraging the AWS S3 lifecycle methods to delete after some time tagged
    // objects we 'DELETED'
    await this.tagMultipleObjectsWithRollback(
      this.permanentBucket,
      fileS3ObjectKeys,
      [{ Key: 'fileStatus', Value: FILE_STATUSES.DELETED }],
    );

    // Update organization's used storage by subtracting the size of deleted files
    const totalBytesToSubtract = files.reduce(
      (sum, file) => sum + file.fileSize,
      0,
    );
    if (totalBytesToSubtract > 0 && files.length > 0) {
      await this.organizationService.updateUsedStorage(
        files[0].organizationId,
        -totalBytesToSubtract,
      );
    }
  }

  /**
   * Retrieves files based on a flexible filter. wrapper service method for repository
   * @param where - db filter criteria to apply (e.g., ID, size, name).
   * @param select - Optional fields to select from the result.
   * @returns Array of files matching the filter criteria.
   */
  async findFiles(where: string, whereParams: any, select?: (keyof FileMgt)[]) {
    return this.fileMgtRepository.findFiles(where, whereParams, select);
  }

  /**
   * Fetches active files within a specified folder for a given organization.
   * @param folderId - ID of the folder (null for root directory).
   * @param organizationId - ID of the organization.
   * @param skip - Number of records to skip (for pagination).
   * @param take - Number of records to fetch (limit).
   * @returns Array of files with basic details.
   */
  async getFiles(
    folderId: string | null,
    organizationId: string,
    skip: number,
    take: number,
  ) {
    return await this.fileMgtRepository.getFiles(
      folderId,
      organizationId,
      skip,
      take,
    );
  }

  /**
   * Fetches folders within a specified parent folder along with counts for files and subfolders.
   * @param folderId - ID of the parent folder (null for root).
   * @param organizationId - ID of the organization.
   * @param skip - Number of records to skip (for pagination).
   * @param take - Number of records to fetch (limit).
   * @returns Array of folders with counts for files and subfolders.
   */
  async getFolders(
    folderId: string | null,
    organizationId: string,
    skip: number,
    take: number,
  ) {
    return this.folderRepository.getFolders(
      folderId,
      organizationId,
      skip,
      take,
    );
  }
  /**
   * Recursively retrieves all ancestor folder IDs for a specified folder.
   * @param folderId - ID of the folder.
   * @returns Array of parent folder IDs from root to the current folder's parent.
   */
  async getParentFolderIds(folderId: string): Promise<string[]> {
    const parentIds = [];
    let currentFolderId = folderId;

    while (currentFolderId) {
      // get the current folder if not throw not found error
      const currentFolder = await this.findFolderById(currentFolderId);

      parentIds.unshift({ id: currentFolder.id, name: currentFolder.name });
      currentFolderId = currentFolder.parentId;
      if (!currentFolder?.parentId) {
        break;
      }
    }
    return parentIds;
  }

  /**
   * Tags multiple objects in an S3 bucket with a specified set of tags.
   * Implements a transaction-like behavior: if any tagging operation fails,
   * all successfully tagged objects will have their tags reverted (rollback).
   *
   * @param bucketName - The name of the S3 bucket.
   * @param keys - The list of object keys to tag.
   * @param tags - An array of tag objects to apply to each S3 object.
   * @param roolBackTags - Tag should add when rollback
   *
   * @throws Error if any tagging operation fails, with all successful taggings rolled back.
   */
  async tagMultipleObjectsWithRollback(
    bucketName: string,
    keys: string[],
    tags: Tag[],
    roolBackTags: Tag[] = [],
  ): Promise<void> {
    console.log(
      'tagMultipleObjectsWithRollback-->',
      bucketName,
      keys,
      tags,
      roolBackTags,
    );
    const taggingPromises: Promise<TaggingResult>[] = keys.map((key) => {
      return this.awsS3Service
        .applyObjectTags(bucketName, key, tags)
        .then(() => ({ status: 'fulfilled', key }) as TaggingResult) // Success result
        .catch(
          (error) => ({ status: 'rejected', key, error }) as TaggingResult,
        ); // Failure result
    });

    const results = await Promise.allSettled(taggingPromises);

    // Separate fulfilled and rejected results using type narrowing
    const failedTags = results
      .filter(
        (result): result is PromiseFulfilledResult<TaggingResult> =>
          result.status === 'rejected',
      )
      .map((result) => result.value); // Cast to TaggingResult

    const successfulTags = results
      .filter(
        (result): result is PromiseFulfilledResult<TaggingResult> =>
          result.status === 'fulfilled',
      )
      .map((result) => result.value); // Cast to TaggingResult

    console.log('successfulTags-->', successfulTags);
    console.log('failedTags-->', failedTags);
    console.log('Tags applied to all objects successfully.');
  }

  /**
   * Updates the name of a file.
   * @param id - The ID of the file.
   * @param newName - The new name to set.
   * @returns Success message indicating the file name was updated.
   */
  async updateFileName(id: string, newName: string) {
    // check for the file existence
    await this.findFileById(id);
    await this.fileMgtRepository.updateFile(id, { fileName: newName });
    return { message: `File renamed to ${newName} successfully.` };
  }

  /**
   * Creates a new folder within an organization, optionally within a parent folder.
   * @param createFolderDto - The folder creation data.
   * @returns The created folder record.
   */
  async createFolder(createFolderData: Partial<Folder>) {
    return this.folderRepository.createFolder(createFolderData);
  }

  /**
   *
   * @param fileKey the key to the storage
   * @returns
   */
  async getDirtyBucketObjectMetadata(
    fileKey: string,
  ): Promise<HeadObjectCommandOutput | null> {
    return this.awsS3Service.getObjectMetadata(this.dirtyBucket, fileKey);
  }

  /**
   * Get the metadata of a file in the permanent bucket.
   *
   * @param fileKey - The key of the file in the permanent bucket.
   * @returns The metadata of the file.
   */
  async getPermanentBucketObjectMetadata(
    fileKey: string,
  ): Promise<HeadObjectCommandOutput | null> {
    return this.awsS3Service.getObjectMetadata(this.permanentBucket, fileKey);
  }

  /**
   * Confirms file uploads by moving files from temporary storage to permanent storage
   * and creating corresponding database records.
   *
   * @param createFileData - Array of file data objects containing information about uploaded files
   * @param organizationId - ID of the organization that owns the files
   * @returns Array of created file records with updated file sizes
   *
   * @example
   * // Usage in another service
   * const fileRecords = await fileManagementService.confirmUpload(
   *   [
   *     {
   *       fileName: 'document.pdf',
   *       parentId: 'folder-uuid',
   *       s3ObjectKey: 'temp/uuid/document.pdf',
   *       fileSize: 0 // Will be updated with actual size
   *     }
   *   ],
   *   'organization-uuid'
   * );
   */
  @Transactional()
  async confirmUpload(
    createFileData: createFileData[],
    organizationId: string,
    userId: string,
  ) {
    // Check if the files exist in the dirty bucket and get their metadata
    const dirtyBucketObjMetadata = createFileData.map(
      ({ s3ObjectKey: fileKey }) => this.getDirtyBucketObjectMetadata(fileKey),
    );

    const fileData = await Promise.all(dirtyBucketObjMetadata);

    // Update file records with actual file sizes from S3
    const fileRecordData = createFileData.map((file, index) => ({
      ...file,
      folderId: file.parentId,
      fileSize: fileData[index].ContentLength,
    }));

    // Create file records in the database
    await this.createFileRecords(fileRecordData, organizationId, userId);

    // Update organization's used storage
    const totalBytesToAdd = fileRecordData.reduce(
      (sum, file) => sum + file.fileSize,
      0,
    );
    await this.organizationService.updateUsedStorage(
      organizationId,
      totalBytesToAdd,
    );

    // Move files from dirty bucket to permanent storage
    const moveFileToPermanentStoragePromises = createFileData.map(
      ({ s3ObjectKey }) => this.copyFileToMainStorage(s3ObjectKey),
    );
    await Promise.all(moveFileToPermanentStoragePromises);

    return fileRecordData;
  }

  /**
   * Creates multiple file records in the database.
   * @param createFileData - An array of file creation data.
   * @returns The created file records.
   */
  async createFileRecords(
    createFileData: any[],
    orgnizationId: string,
    userId: string,
  ) {
    return this.fileMgtRepository.createFileRecords(
      createFileData,
      orgnizationId,
      userId,
    );
  }

  /**
   * Get S3 object as a readable stream for a file.
   * @param s3ObjectKey - The S3 object key of the file.
   * @returns The S3 object as a readable stream.
   */
  async getPermentStorageObjectStream(
    s3ObjectKey: string,
  ): Promise<GetObjectCommandOutput> {
    return this.awsS3Service.getS3ObjectStream(
      this.permanentBucket,
      s3ObjectKey,
    );
  }

  /**
   * Recursively add folder contents to archive.
   * @param folderId - The ID of the folder to add to the archive.
   * @param archive - The archive object to append files and folders to.
   */
  async addFolderToArchive(folderId: string, archive: archiver.Archiver) {
    // Fetch folder details, including files and subfolders
    const folder = await this.folderRepository.getFolderWithRelations(folderId);
    // Add each file in the folder to the archive
    for (const file of folder.files) {
      const s3ObjectStream = await this.getPermentStorageObjectStream(
        file.s3ObjectKey,
      );
      archive.append(s3ObjectStream.Body, {
        name: `${folder.path}/${file.fileName}`,
      }); // Append the file to the archive with the correct path
    }

    // Recursively add subfolders to the archive
    for (const subFolder of folder.subFolders) {
      await this.addFolderToArchive(subFolder.id, archive); // Recursive call for each subfolder
    }
  }
}
