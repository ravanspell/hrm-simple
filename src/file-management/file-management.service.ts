import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateFileManagementDto } from './dto/update-file-management.dto';
import { ConfigService } from '@nestjs/config';
import {
  GetObjectCommandOutput,
  HeadObjectCommandOutput,
  S3Client,
  Tag,
} from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import { DatabaseService } from 'src/database/database.service';
import { FileMgt, Prisma } from '@prisma/client';
import * as archiver from 'archiver';
import { FILE_STATUSES } from './constants';
import { AwsS3Service } from './aws-S3.service';

interface TaggingResult {
  status: 'fulfilled' | 'rejected';
  key: string;
  error?: Error;
}

export interface createFileData {
  fileName: string
  parentId: string
  s3ObjectKey: string
  fileSize: number
}

@Injectable()
export class FileManagementService {
  private s3Client: S3Client;
  private dirtyBucket: string;
  private permanentBucket: string;

  constructor(
    private configService: ConfigService,
    private databseService: DatabaseService,
    private awsS3Service: AwsS3Service,
  ) {
    this.s3Client = new S3Client({
      region: this.configService.get<string>('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get<string>(
          'AWS_SECRET_ACCESS_KEY',
        ),
      },
    });
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
    const file = await this.databseService.fileMgt.findUnique({
      where: { id },
    });
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
    const file = await this.databseService.folder.findUnique({ where: { id } });
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
    await this.databseService.folder.update({
      where: { id },
      data: { name: folderName },
    });
    return { message: `Folder renamed to ${folderName} successfully.` };
  }

  /**
   * Generates a presigned URL for uploading a file to the dirty bucket.
   *
   * @param filename - uploading file name.
   * @param fileType - file extention of the file.
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
    const uploadUrl = await this.awsS3Service.copyObject(
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
    return `This action updates a #${id} fileManagement`;
  }

  /**
   * Deletes multiple files based on an array of file IDs.
   * @param ids - Array of file IDs to delete.
   * @param files - Array of file data to update status.
   * @returns
   */
  async softdeleteFiles(ids: string[], files: FileMgt[]) {
    await this.databseService.fileMgt.updateMany({
      where: { id: { in: ids } },
      data: [
        files.map((file) => ({
          ...file,
          fileStatus: FILE_STATUSES.DELETED,
        })),
      ],
    });

    const fileS3ObjectKeys = files.map((file) => file.s3ObjectKey);

    this.tagMultipleObjectsWithRollback(
      this.permanentBucket,
      fileS3ObjectKeys,
      [{ Key: 'fileStatus', Value: FILE_STATUSES.DELETED }],
    );
  }

  /**
   * Retrieves files based on a flexible filter.
   * @param where - db filter criteria to apply (e.g., ID, size, name).
   * @param select - Optional fields to select from the result.
   * @returns Array of files matching the filter criteria.
   */
  async findFiles(
    where: Prisma.FileMgtWhereInput,
    select?: Prisma.FileMgtSelect,
  ) {
    return this.databseService.fileMgt.findMany({
      where,
      select,
    });
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
    return this.databseService.fileMgt.findMany({
      where: {
        folderId: folderId || null,
        organizationId,
        fileStatus: 'ACTIVE',
      },
      orderBy: [
        {
          updatedAt: 'desc',
        },
      ],
      include: {
        updater: {
          select: {
            firstName: true,
            lastName: true,
            id: true,
          },
        },
      },
      skip,
      take,
    });
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
    return this.databseService.folder.findMany({
      where: {
        parentId: folderId || null,
        organizationId,
      },
      include: {
        _count: {
          select: {
            files: true,
            subFolders: true,
          },
        },
        updater: {
          select: {
            firstName: true,
            lastName: true,
            id: true,
          },
        },
      },
      orderBy: [
        {
          updatedAt: 'desc',
        },
      ],
      skip,
      take,
    });
  }

  /**
   * Retrieves the total count of files in a specified folder for pagination.
   * @param folderId - ID of the folder (null for root).
   * @param organizationId - ID of the organization.
   * @returns Number of active files within the folder.
   */
  async getFileCount(
    folderId: string | null,
    organizationId: string,
  ): Promise<number> {
    return this.databseService.fileMgt.count({
      where: {
        folderId: folderId || null,
        organizationId,
        fileStatus: 'ACTIVE',
      },
    });
  }

  /**
   * Retrieves the total count of folders in a specified parent folder for pagination.
   * @param folderId - ID of the parent folder (null for root).
   * @param organizationId - ID of the organization.
   * @returns Number of subfolders within the parent folder.
   */
  async getFolderCount(
    folderId: string | null,
    organizationId: string,
  ): Promise<number> {
    return this.databseService.folder.count({
      where: {
        parentId: folderId || null,
        organizationId,
      },
    });
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
      const currentFolder = await this.databseService.folder.findUnique({
        where: { id: currentFolderId },
        select: { parentId: true, name: true, id: true },
      });

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
    console.log('Tags applied to all objects successfully.');
  }

  /**
   * Updates the name of a file.
   * @param id - The ID of the file.
   * @param newName - The new name to set.
   * @returns Success message indicating the file name was updated.
   */
  async updateFileName(id: string, newName: string) {
    await this.databseService.fileMgt.update({
      where: { id },
      data: { fileName: newName },
    });
    return { message: `File renamed to ${newName} successfully.` };
  }

  /**
   * Creates a new folder within an organization, optionally within a parent folder.
   * @param createFolderDto - The folder creation data.
   * @returns The created folder record.
   */
  async createFolder(createFolderData: any) {
    const { name, organizationId, parentId, path } = createFolderData;
    // Create the new folder in the database
    return this.databseService.folder.create({
      data: {
        name,
        path,
        organization: {
          connect: { id: organizationId },
        },
        ...(parentId && {
          parentFolder: { connect: { id: parentId } },
        }),
        creator: { connect: { id: '001d9ff0-80f3-40ba-8ffe-48e1b7dc9730' } },
        updater: { connect: { id: '001d9ff0-80f3-40ba-8ffe-48e1b7dc9730' } },
      },
    });
  }

  /**
   *
   * @param fileKey the key to the storage
   * @returns
   */
  async getDirtyBucketObjectMetadata(
    fileKey: string,
  ): Promise<HeadObjectCommandOutput> {
    return this.awsS3Service.getObjectMetadata(this.permanentBucket, fileKey);
  }


  async confirmUpload(createFileData: createFileData[], organizationId: string) {

    // Check if the file exists in the dirty bucket
    const dirtyBucketObjMetadata = createFileData.map(({ s3ObjectKey: fileKey }) => (
      this.getDirtyBucketObjectMetadata(fileKey)
    ));

    const fileData = await Promise.all(dirtyBucketObjMetadata);

    const moveFileToPermemntStoragePromises = createFileData.map(({ s3ObjectKey: fileKey }) => (
      this.copyFileToMainStorage(fileKey)
    ));
    await Promise.all(moveFileToPermemntStoragePromises);

    const fileRecordData = createFileData.map((file, index) => ({
      ...file,
      fileSize: fileData[index].ContentLength,
    }));
    await this.createFileRecords(fileRecordData, organizationId)
  }

  /**
   * Creates multiple file records in the database.
   * @param createFileData - An array of file creation data.
   * @returns The created file records.
   */
  async createFileRecords(createFileData: createFileData[], organizationId: string) {
    const transactionPromises = createFileData.map(data => {
      const { fileName, parentId, fileSize, s3ObjectKey } = data;

      return this.databseService.fileMgt.create({
        data: {
          fileName,
          fileSize,
          fileStatus: FILE_STATUSES.ACTIVE,
          s3ObjectKey,
          organization: {
            connect: { id: organizationId },
          },
          ...(parentId && {
            parentFolder: { connect: { id: parentId } },
          }),
          creator: { connect: { id: '001d9ff0-80f3-40ba-8ffe-48e1b7dc9730' } },
          updater: { connect: { id: '001d9ff0-80f3-40ba-8ffe-48e1b7dc9730' } },
        },
      });
    });

    try {
      // Execute all operations in a single transaction
      await this.databseService.$transaction(transactionPromises);

      console.log('All operations committed successfully.');
    } catch (error) {
      console.error('Transaction failed. Rolling back operations:', error);
      throw new Error('Transaction failed. Rolled back changes.');
    }
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
    const folder = await this.databseService.folder.findUnique({
      where: {
        id: folderId,
      },
      include: {
        files: true,
        subFolders: true,
      },
    });

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
