/*
  Warnings:

  - You are about to drop the `RoleScope` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `RoleScope` DROP FOREIGN KEY `RoleScope_roleId_fkey`;

-- DropForeignKey
ALTER TABLE `RoleScope` DROP FOREIGN KEY `RoleScope_scopeId_fkey`;

-- DropTable
DROP TABLE `RoleScope`;

-- CreateTable
CREATE TABLE `_RoleScopes` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_RoleScopes_AB_unique`(`A`, `B`),
    INDEX `_RoleScopes_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `_RoleScopes` ADD CONSTRAINT `_RoleScopes_A_fkey` FOREIGN KEY (`A`) REFERENCES `Role`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_RoleScopes` ADD CONSTRAINT `_RoleScopes_B_fkey` FOREIGN KEY (`B`) REFERENCES `Scope`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `Scope` RENAME INDEX `Scope_organizationId_fkey` TO `Scope_organizationId_idx`;
