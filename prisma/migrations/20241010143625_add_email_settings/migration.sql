-- CreateTable
CREATE TABLE `EmailSettings` (
    `id` VARCHAR(191) NOT NULL,
    `emailHost` VARCHAR(191) NOT NULL,
    `emailPort` INTEGER NOT NULL,
    `displayName` VARCHAR(191) NOT NULL,
    `defaultFromEmail` VARCHAR(191) NOT NULL,
    `emailHostUsername` VARCHAR(191) NOT NULL,
    `encryptedEmailAuthPassword` VARCHAR(191) NOT NULL,
    `useTLS` BOOLEAN NOT NULL DEFAULT false,
    `useSSL` BOOLEAN NOT NULL DEFAULT false,
    `isPrimary` BOOLEAN NOT NULL DEFAULT false,
    `emailSendTimeout` INTEGER NOT NULL DEFAULT 30000,
    `organizationId` INTEGER NOT NULL,

    INDEX `EmailSettings_organizationId_idx`(`organizationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `EmailSettings` ADD CONSTRAINT `EmailSettings_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `Organization`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
