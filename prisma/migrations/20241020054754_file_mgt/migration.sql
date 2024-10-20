/*
  Warnings:

  - You are about to drop the column `folderPath` on the `FileMgt` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `FileMgt` DROP COLUMN `folderPath`,
    ADD COLUMN `deletionTime` DATETIME(3) NULL,
    ADD COLUMN `fileStatus` ENUM('ACTIVE', 'DELETED') NOT NULL DEFAULT 'ACTIVE',
    ADD COLUMN `folderId` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `Folder` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `parentId` VARCHAR(191) NULL,
    `path` VARCHAR(191) NOT NULL,
    `organizationId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `FileMgt` ADD CONSTRAINT `FileMgt_folderId_fkey` FOREIGN KEY (`folderId`) REFERENCES `Folder`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Folder` ADD CONSTRAINT `Folder_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `Organization`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Folder` ADD CONSTRAINT `Folder_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `Folder`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
