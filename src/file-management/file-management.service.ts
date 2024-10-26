import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { UpdateFileManagementDto } from './dto/update-file-management.dto';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { ConfigService } from '@nestjs/config';
import {
  CopyObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  HeadObjectCommandOutput,
  PutObjectCommand,
  PutObjectTaggingCommand,
  S3Client
} from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class FileManagementService {
  private s3Client: S3Client;
  private dirtyBucket: string;
  private permanentBucket: string;

  constructor(
    private configService: ConfigService,
    private databseService: DatabaseService
  ) {
    this.s3Client = new S3Client({
      region: this.configService.get<string>('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY'),
      },
    });
    this.dirtyBucket = this.configService.get<string>('DIRTY_BUCKET_NAME');
    this.permanentBucket = this.configService.get<string>('AWS_PERMANENT_BUCKET');
  }
  /**
   * Generates a presigned URL for uploading a file to the dirty bucket.
   *
   * @param filename - uploading file name.
   * @param fileType - file extention of the file.
   * @returns upload url and key
  */
  async getPresignedUrl(filename: string, fileType: string): Promise<{ uploadUrl: string; key: string }> {
    const key = `${uuidv4()}_${filename}`;

    const command = new PutObjectCommand({
      Bucket: this.dirtyBucket,
      Key: key,
      ContentType: fileType,
    });

    try {
      const uploadUrl = await getSignedUrl(this.s3Client, command, { expiresIn: 300 }); // 5 minutes
      return { uploadUrl, key };
    } catch (error) {
      console.error('Error generating pre-signed URL:', error);
      throw new InternalServerErrorException('Could not generate upload URL');
    }
  }
  /**
   * Confirms the existence of a file in the dirty bucket, copies it to the permanent bucket,
   *
   * @param fileKey - The key (path) of the file in the S3 bucket.
   * @returns A promise that resolves to true if successful, false otherwise.
  */
  async confirmAndMoveFile(fileKey: string): Promise<boolean> {
    // Check if the file exists in the dirty bucket
    const headResult = await this.getObjectMetadata(fileKey)
    console.log(`File '${fileKey}' exists in '${this.dirtyBucket}'.`);

    // file size in bytes
    const fileSize = headResult.ContentLength || 0;
    // Copy the file to the permanent bucket
    const copiedFile = await this.s3Client.send(
      new CopyObjectCommand({
        Bucket: this.permanentBucket,
        CopySource: `${this.dirtyBucket}/${fileKey}`,
        Key: fileKey,
      })
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
  async generatePresignedDownloadUrl(fileKey: string, expiresIn: number = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.permanentBucket,
      Key: fileKey,
    });
    const url = await getSignedUrl(this.s3Client, command, { expiresIn });
    return url;
  }

  createFileRecord() {
    return `This action returns all fileManagement`;
  }

  async findOrganizationAll(organizationId: string, page: number = 1, limit: number = 10) {
    // Ensure page and limit are positive integers
    page = page < 1 ? 1 : page;
    limit = limit < 1 ? 10 : limit;

    const skip = (page - 1) * limit;

    // Fetch files with pagination
    const [files, total] = await Promise.all([
      this.databseService.fileMgt.findMany({
        where: { organizationId },
        skip: skip,
        take: limit,
        orderBy: { uploadedAt: 'desc' }, // Optional: Order by upload date
      }),
      this.databseService.fileMgt.count({
        where: { organizationId },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);
    return { files, total, page, totalPages };
  };

  findOne(id: number) {
    return `This action returns a #${id} fileManagement`;
  }

  update(id: number, updateFileManagementDto: UpdateFileManagementDto) {
    return `This action updates a #${id} fileManagement`;
  }

  remove(id: number) {
    return `This action removes a #${id} fileManagement`;
  }

  async getObjectMetadata(fileKey: string, bucket: string = this.dirtyBucket): Promise<HeadObjectCommandOutput> {
    const headResult = await this.s3Client.send(
      new HeadObjectCommand({
        Bucket: bucket,
        Key: fileKey,
      })
    );
    return headResult;
  }
  /**
   * Fetches active files within a specified folder for a given organization.
   * @param folderId - ID of the folder (null for root directory).
   * @param organizationId - ID of the organization.
   * @param skip - Number of records to skip (for pagination).
   * @param take - Number of records to fetch (limit).
   * @returns Array of files with basic details.
   */
  async getFiles(folderId: string | null, organizationId: string, skip: number, take: number) {
    return this.databseService.fileMgt.findMany({
      where: {
        folderId: folderId || null,
        organizationId,
        fileStatus: 'ACTIVE',
      },
      select: {
        id: true,
        fileName: true,
        fileSize: true,
        s3ObjectKey: true,
        uploadedAt: true,
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
  async getFolders(folderId: string | null, organizationId: string, skip: number, take: number) {
    return this.databseService.folder.findMany({
      where: {
        parentId: folderId || null,
        organizationId,
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
        _count: {
          select: {
            files: true,
            subFolders: true,
          },
        },
      },
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
  async getFileCount(folderId: string | null, organizationId: string): Promise<number> {
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
  async getFolderCount(folderId: string | null, organizationId: string): Promise<number> {
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
    const parentIds: string[] = [];
    let currentFolderId = folderId;

    while (currentFolderId) {
      const currentFolder = await this.databseService.folder.findUnique({
        where: { id: currentFolderId },
        select: { parentId: true },
      });
      if (currentFolder?.parentId) {
        parentIds.unshift(currentFolder.parentId);
        currentFolderId = currentFolder.parentId;
      } else {
        break;
      }
    }
    return parentIds;
  }
  /**
   * Function to apply tags to an S3 object.
   * @param bucketName - The name of the S3 bucket.
   * @param objectKey - The key of the S3 object.
   * @param tags - An array of tags to apply to the object.
  */
  async applyS3ObjectTags(
    bucketName: string,
    objectKey: string,
    tags: { Key: string, Value: string }[]
  ) {
    const command = new PutObjectTaggingCommand({
      Bucket: bucketName,
      Key: objectKey,
      Tagging: {
        TagSet: tags,
      },
    });
    const response = await this.s3Client.send(command);
    console.log('Tags applied successfully:', response);
  };
}

