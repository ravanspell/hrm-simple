import { DataSource, Repository, UpdateResult } from 'typeorm';
import { Injectable } from '@nestjs/common';
import {
  FileMgt,
  FileStatus,
} from 'src/file-management/entities/file-management.entity';

@Injectable()
export class FileMgtRepository extends Repository<FileMgt> {
  constructor(dataSource: DataSource) {
    super(FileMgt, dataSource.createEntityManager());
  }

  /**
   * Creates multiple file records in the database.
   * @param createFileData - An array of file creation data.
   * @returns The created file records.
   */
  async createFileRecords(
    createFileData: Partial<FileMgt[]>,
    organizationId: string,
  ): Promise<FileMgt[]> {
    const files = createFileData.map((data: Partial<FileMgt>) => {
      const {
        fileName,
        fileSize,
        s3ObjectKey,
        folderId,
        createdBy,
        updatedBy,
      } = data;
      return {
        fileName,
        fileSize,
        s3ObjectKey,
        organization: { id: organizationId },
        folder: folderId ? { id: folderId } : null,
        creator: { id: createdBy },
        updater: { id: updatedBy },
      };
    });
    const fileRecordsObj = this.create(files);
    return this.save(fileRecordsObj);
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
    const getFileQuery = this.createQueryBuilder('file')
      .leftJoinAndSelect('file.updater', 'updater')
      .andWhere('file.organizationId = :organizationId', { organizationId })
      .andWhere('file.fileStatus = :fileStatus', { fileStatus: 'ACTIVE' })
      .orderBy('file.updatedAt', 'DESC')
      .select([
        'file.id',
        'file.fileName',
        'file.fileSize',
        'file.updatedAt',
        'file.createdBy',
        'file.updatedBy',
        'file.uploadedAt',
        'file.folderId',
        'file.organizationId',
        'file.fileStatus',
        'file.deletionTime',
        'file.s3ObjectKey',

        'updater.id',
        'updater.firstName',
        'updater.lastName',
      ])
      .skip(skip)
      .take(take);

    if (folderId) {
      getFileQuery.where('file.folderId = :folderId', { folderId });
    }

    return getFileQuery.getManyAndCount();
  }
  /**
   * fetch file data by id
   * @param id
   * @returns FileMgt file data
   */
  async getFileById(id: string): Promise<FileMgt> {
    return this.findOne({ where: { id } });
  }

  /**
   * Soft deletes multiple files by updating their status to DELETED.
   * @param ids - Array of file IDs to be soft deleted.
   * @returns The result of the update operation.
   */
  async softDeleteFiles(fileIds: string[]) {
    return this.createQueryBuilder()
      .update(FileMgt)
      .set({ fileStatus: FileStatus.DELETED })
      .where('id IN (:...fileIds)', { fileIds })
      .execute();
  }

  async updateFile(
    id: string,
    fileData: Partial<FileMgt>,
  ): Promise<UpdateResult> {
    return this.update(id, { ...fileData });
  }

  /**
   * Retrieves files based on a flexible filter.
   * @param where - Database filter criteria to apply (e.g., ID, size, name).
   * @param select - Optional fields to select from the result.
   * @returns Array of files matching the filter criteria.
   */
  async findFiles(where: string, whereParams: any, select?: (keyof FileMgt)[]) {
    const query = this.createQueryBuilder('file').where(where, whereParams);

    if (select) {
      query.select(select.map((field) => `file.${field}`));
    }
    return query.getMany();
  }
}
