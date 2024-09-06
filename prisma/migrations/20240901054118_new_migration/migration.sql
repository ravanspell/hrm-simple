-- CreateTable
CREATE TABLE `Users` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `firstName` VARCHAR(191) NOT NULL,
    `lastName` VARCHAR(191) NOT NULL,
    `gender` ENUM('MALE', 'FEMALE', 'OTHER') NOT NULL,
    `employmentStatusId` BIGINT NOT NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `createdBy` BIGINT NULL,
    `updatedBy` BIGINT NULL,
    `employeeLevelId` BIGINT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EmploymentStatus` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `status` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EmployeeLevel` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LeaveTypes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `createdBy` BIGINT NULL,
    `updatedBy` BIGINT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EmpLeaveHistory` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `employeeId` BIGINT NOT NULL,
    `leaveTypeId` INTEGER NOT NULL,
    `leaveHours` BIGINT NOT NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL,
    `approvedBy` BIGINT NULL,
    `comments` VARCHAR(191) NULL,

    INDEX `EmpLeaveHistory_employeeId_idx`(`employeeId`),
    INDEX `EmpLeaveHistory_leaveTypeId_idx`(`leaveTypeId`),
    INDEX `EmpLeaveHistory_status_idx`(`status`),
    INDEX `EmpLeaveHistory_approvedBy_idx`(`approvedBy`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LeaveAllocations` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `employeeLevelId` BIGINT NOT NULL,
    `leaveTypeId` INTEGER NOT NULL,
    `totalLeaveHours` INTEGER NOT NULL,

    INDEX `LeaveAllocations_employeeLevelId_idx`(`employeeLevelId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LeaveBalance` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `employeeId` BIGINT NOT NULL,
    `leaveTypeId` INTEGER NOT NULL,
    `usedLeaveHours` INTEGER NOT NULL,
    `leaveAllocatedHours` INTEGER NOT NULL,
    `lastUpdated` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` BIGINT NULL,
    `updatedBy` BIGINT NULL,

    INDEX `LeaveBalance_employeeId_idx`(`employeeId`),
    INDEX `LeaveBalance_leaveTypeId_idx`(`leaveTypeId`),
    INDEX `LeaveBalance_updatedBy_idx`(`updatedBy`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Users` ADD CONSTRAINT `Users_employmentStatusId_fkey` FOREIGN KEY (`employmentStatusId`) REFERENCES `EmploymentStatus`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Users` ADD CONSTRAINT `Users_employeeLevelId_fkey` FOREIGN KEY (`employeeLevelId`) REFERENCES `EmployeeLevel`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EmpLeaveHistory` ADD CONSTRAINT `EmpLeaveHistory_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `Users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EmpLeaveHistory` ADD CONSTRAINT `EmpLeaveHistory_leaveTypeId_fkey` FOREIGN KEY (`leaveTypeId`) REFERENCES `LeaveTypes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LeaveAllocations` ADD CONSTRAINT `LeaveAllocations_employeeLevelId_fkey` FOREIGN KEY (`employeeLevelId`) REFERENCES `EmployeeLevel`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LeaveAllocations` ADD CONSTRAINT `LeaveAllocations_leaveTypeId_fkey` FOREIGN KEY (`leaveTypeId`) REFERENCES `LeaveTypes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LeaveBalance` ADD CONSTRAINT `LeaveBalance_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `Users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LeaveBalance` ADD CONSTRAINT `LeaveBalance_leaveTypeId_fkey` FOREIGN KEY (`leaveTypeId`) REFERENCES `LeaveTypes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
