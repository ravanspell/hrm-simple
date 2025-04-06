import { DataSource, Repository, UpdateResult } from 'typeorm';
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
      getFoldersQuery.andWhere('folder.parentId = :folderId', { folderId });
    } else {
      getFoldersQuery.andWhere('folder.parentId IS NULL');
    }
    return getFoldersQuery.getManyAndCount();
  }

  /**
   * Retrieves a folder by its ID.
   *
   * @param id - The ID of the folder to retrieve.
   * @returns A promise that resolves to the folder entity.
   */
  async getFolderById(id: string): Promise<Folder> {
    return this.findOne({ where: { id } });
  }

  /**
   * Updates a folder with the given data.
   *
   * @param id - The ID of the folder to update.
   * @param folderData - Partial data to update the folder with.
   * @returns A promise that resolves to the result of the update operation.
   */
  async updateFolder(
    id: string,
    folderData: Partial<Folder>,
  ): Promise<UpdateResult> {
    return this.update(id, { ...folderData });
  }
  /**
   * Creates a new folder within an organization, optionally within a parent folder.
   * @param createFolderData - The folder creation data.
   * @returns The created folder record.
   */
  async createFolder(createFolderData: Partial<Folder>): Promise<Folder> {
    const { name, organizationId, parentId, path, createdBy, updatedBy } =
      createFolderData;

    const folder = this.create({
      name,
      path,
      organization: { id: organizationId },
      creator: { id: createdBy },
      updater: { id: updatedBy },
      parentFolder: parentId ? { id: parentId } : null,
    });

    return this.save(folder);
  }

  /**
   * Fetches a folder by its ID, including its files and subfolders.
   * @param folderId - ID of the folder to fetch.
   * @returns The folder with its files and subfolders.
   */
  async getFolderWithRelations(folderId: string) {
    return this.findOneOrFail({
      where: { id: folderId },
      relations: ['files', 'subFolders'],
    });
  }
}
