/*
  Warnings:

  - Added the required column `categoryId` to the `Scope` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Scope` ADD COLUMN `categoryId` VARCHAR(191) NOT NULL;

-- CreateTable
CREATE TABLE `ScopeCategory` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ScopeCategory_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Scope` ADD CONSTRAINT `Scope_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `ScopeCategory`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
