import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { UpdateFileManagementDto } from './dto/update-file-management.dto';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { ConfigService } from '@nestjs/config';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FileManagementService {
  private s3Client: S3Client;
  private dirtyBucket: string;
  // private permanentBucket: string;

  constructor(private configService: ConfigService) {
    this.s3Client = new S3Client({
      region: this.configService.get<string>('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY'),
      },
    });
    this.dirtyBucket = this.configService.get<string>('DIRTY_BUCKET_NAME');
    // this.permanentBucket = this.configService.get<string>('AWS_PERMANENT_BUCKET');
  }
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
