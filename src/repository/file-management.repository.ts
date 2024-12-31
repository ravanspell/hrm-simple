import { DataSource, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { FileMgt } from 'src/file-management/entities/file-management.entity';

@Injectable()
export class FileMgtRepository extends Repository<FileMgt> {
    constructor(dataSource: DataSource) {
        super(FileMgt, dataSource.createEntityManager());
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
            .take(take)
        console.log("this is the folderId", folderId);

        if (folderId) {
            getFileQuery.where('file.folderId = :folderId', { folderId })
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
}
