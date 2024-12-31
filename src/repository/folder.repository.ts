import { DataSource, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { Folder } from 'src/file-management/entities/folder.entity';

@Injectable()
export class FolderRepository extends Repository<Folder> {
    constructor(dataSource: DataSource) {
        super(Folder, dataSource.createEntityManager());
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
        const getFoldersQuery = this.createQueryBuilder('folder')
            .leftJoinAndSelect('folder.subFolders', 'subFolders')
            .leftJoinAndSelect('folder.files', 'files')
            .leftJoinAndSelect('folder.updater', 'updater')
            .andWhere('folder.organizationId = :organizationId', { organizationId })
            .loadRelationCountAndMap('folder.fileCount', 'folder.files')
            .loadRelationCountAndMap('folder.subFolderCount', 'folder.subFolders')
            .orderBy('folder.updatedAt', 'DESC')
            .select([
                'folder.id',
                'folder.name',
                'folder.path',
                'folder.updatedAt',
                'updater.id',
                'updater.firstName',
                'updater.lastName',
            ])
            .skip(skip)
            .take(take);

        if (folderId) {
            getFoldersQuery.where('folder.parentId = :folderId', { folderId })
        }
        return getFoldersQuery.getManyAndCount();
    }
}