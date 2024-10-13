import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { UpdateFileManagementDto } from './dto/update-file-management.dto';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { ConfigService } from '@nestjs/config';
import { CopyObjectCommand, GetObjectCommand, HeadObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FileManagementService {
  private s3Client: S3Client;
  private dirtyBucket: string;
  private permanentBucket: string;

  constructor(private configService: ConfigService) {
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
    const headResult = await this.s3Client.send(
      new HeadObjectCommand({
        Bucket: this.dirtyBucket,
        Key: fileKey,
      })
    );
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

  findAll() {
    return `This action returns all fileManagement`;
  }

  findOne(id: number) {
    return `This action returns a #${id} fileManagement`;
  }

  update(id: number, updateFileManagementDto: UpdateFileManagementDto) {
    return `This action updates a #${id} fileManagement`;
  }

  remove(id: number) {
    return `This action removes a #${id} fileManagement`;
  }
}
