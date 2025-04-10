import {
  Injectable,
  InternalServerErrorException,
  HttpStatus,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  CopyObjectCommand,
  CopyObjectCommandOutput,
  GetObjectCommand,
  GetObjectCommandInput,
  GetObjectCommandOutput,
  HeadObjectCommand,
  HeadObjectCommandOutput,
  NotFound,
  PutObjectCommand,
  PutObjectTaggingCommand,
  PutObjectTaggingCommandOutput,
  S3Client,
  Tag,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class AwsS3Service {
  private s3Client: S3Client;

  constructor(private configService: ConfigService) {
    this.s3Client = new S3Client({
      region: this.configService.get<string>('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get<string>(
          'AWS_SECRET_ACCESS_KEY',
        ),
      },
    });
  }

  /**
   * Generates a pre-signed URL for uploading a file.
   * @param bucketName - The target S3 bucket.
   * @param key - The key for the S3 object.
   * @param contentType - The content type of the file.
   * @returns Pre-signed URL for uploading the file.
   */
  async generateUploadPreSignedUrl(
    bucketName: string,
    key: string,
    contentType: string,
  ): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      ContentType: contentType,
      ACL: 'private',
    });

    try {
      return await getSignedUrl(this.s3Client, command, { expiresIn: 300 }); // 5 minutes
    } catch (error) {
      console.error('Error generating pre-signed upload URL:', error);
      throw new InternalServerErrorException('Failed to generate upload URL');
    }
  }

  /**
   * Generates a pre-signed URL for downloading a file.
   * @param bucketName - The target S3 bucket.
   * @param key - The key for the S3 object.
   * @param expiresIn - Time in seconds for the pre-signed URL to remain valid.
   * @returns Pre-signed URL for downloading the file.
   */
  async generateDownloadPresignedUrl(
    bucketName: string,
    key: string,
    expiresIn: number = 3600,
  ): Promise<string> {
    const command = new GetObjectCommand({ Bucket: bucketName, Key: key });
    return await getSignedUrl(this.s3Client, command, { expiresIn });
  }

  /**
   * Copies an object from one bucket to another.
   * @param sourceBucket - The source S3 bucket.
   * @param destinationBucket - The destination S3 bucket.
   * @param sourceKey - The key of the source object.
   * @param destinationKey - The key for the destination object.
   */
  async copyObject(
    sourceBucket: string,
    destinationBucket: string,
    sourceKey: string,
    destinationKey: string,
  ): Promise<CopyObjectCommandOutput> {
    const command = new CopyObjectCommand({
      Bucket: destinationBucket,
      CopySource: `${sourceBucket}/${sourceKey}`,
      Key: destinationKey,
    });

    try {
      return await this.s3Client.send(command);
    } catch (error) {
      console.error('Error copying object:', error);
      throw new InternalServerErrorException('Failed to copy object');
    }
  }

  /**
   * Retrieves metadata for an object in S3.
   * @param bucketName - The S3 bucket name.
   * @param key - The key of the S3 object.
   * @returns Metadata of the S3 object.
   */
  async getObjectMetadata(
    bucketName: string,
    key: string,
  ): Promise<HeadObjectCommandOutput | null> {
    const command = new HeadObjectCommand({ Bucket: bucketName, Key: key });
    try {
      return await this.s3Client.send(command);
    } catch (error: unknown) {
      if (this.isNotFoundError(error)) {
        return null;
      }
      throw new InternalServerErrorException('Failed to fetch object metadata');
    }
  }

  /**
   * Applies tags to an S3 object.
   * @param bucketName - The name of the S3 bucket.
   * @param key - The key of the S3 object.
   * @param tags - An array of tags to apply to the object.
   */
  async applyObjectTags(
    bucketName: string,
    key: string,
    tags: Tag[],
  ): Promise<PutObjectTaggingCommandOutput> {
    const command = new PutObjectTaggingCommand({
      Bucket: bucketName,
      Key: key,
      Tagging: { TagSet: tags },
    });

    try {
      return await this.s3Client.send(command);
    } catch (error) {
      console.error('Error applying tags to object:', error);
      throw new InternalServerErrorException('Failed to apply tags');
    }
  }

  /**
   * Get S3 object as a readable stream for a file.
   * @param s3ObjectKey - The S3 object key of the file.
   * @returns The S3 object as a readable stream.
   */
  async getS3ObjectStream(
    bucket: string,
    s3ObjectKey: string,
  ): Promise<GetObjectCommandOutput> {
    const params: GetObjectCommandInput = {
      Bucket: bucket,
      Key: s3ObjectKey, // S3 object key for the file
    };
    const command = new GetObjectCommand(params);
    return await this.s3Client.send(command);
  }

  /**
   * Checks if an error is a NotFound error.
   * @param err - The error to check.
   * @returns True if the error is a NotFound error, false otherwise.
   */
  private isNotFoundError(err: unknown): err is NotFound {
    return (
      typeof err === 'object' &&
      err !== null &&
      'name' in err &&
      (err as any).name === 'NotFound' &&
      (err as any).$metadata?.httpStatusCode === HttpStatus.NOT_FOUND
    );
  }
}
