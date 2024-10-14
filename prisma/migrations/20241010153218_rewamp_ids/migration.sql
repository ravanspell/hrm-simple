/*
  Warnings:

  - You are about to drop the column `encryptedEmailAuthPassword` on the `EmailSettings` table. All the data in the column will be lost.
  - The primary key for the `EmpLeaveHistory` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `EmployeeLevel` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `EmploymentStatus` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `LeaveAllocation` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `LeaveBalance` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `LeaveType` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Organization` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `emailAuthPassword` to the `EmailSettings` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `EmailSettings` DROP FOREIGN KEY `EmailSettings_organizationId_fkey`;

-- DropForeignKey
ALTER TABLE `EmpLeaveHistory` DROP FOREIGN KEY `EmpLeaveHistory_employeeId_fkey`;

-- DropForeignKey
ALTER TABLE `EmpLeaveHistory` DROP FOREIGN KEY `EmpLeaveHistory_leaveTypeId_fkey`;

-- DropForeignKey
ALTER TABLE `EmpLeaveHistory` DROP FOREIGN KEY `EmpLeaveHistory_organizationId_fkey`;

-- DropForeignKey
ALTER TABLE `EmployeeLevel` DROP FOREIGN KEY `EmployeeLevel_organizationId_fkey`;

-- DropForeignKey
ALTER TABLE `EmploymentStatus` DROP FOREIGN KEY `EmploymentStatus_organizationId_fkey`;

-- DropForeignKey
ALTER TABLE `LeaveAllocation` DROP FOREIGN KEY `LeaveAllocation_employeeLevelId_fkey`;

-- DropForeignKey
ALTER TABLE `LeaveAllocation` DROP FOREIGN KEY `LeaveAllocation_leaveTypeId_fkey`;

-- DropForeignKey
ALTER TABLE `LeaveAllocation` DROP FOREIGN KEY `LeaveAllocation_organizationId_fkey`;

-- DropForeignKey
ALTER TABLE `LeaveBalance` DROP FOREIGN KEY `LeaveBalance_employeeId_fkey`;

-- DropForeignKey
ALTER TABLE `LeaveBalance` DROP FOREIGN KEY `LeaveBalance_leaveTypeId_fkey`;

-- DropForeignKey
ALTER TABLE `LeaveBalance` DROP FOREIGN KEY `LeaveBalance_organizationId_fkey`;

-- DropForeignKey
ALTER TABLE `LeaveType` DROP FOREIGN KEY `LeaveType_organizationId_fkey`;

-- DropForeignKey
ALTER TABLE `User` DROP FOREIGN KEY `User_employeeLevelId_fkey`;

-- DropForeignKey
ALTER TABLE `User` DROP FOREIGN KEY `User_employmentStatusId_fkey`;

-- DropForeignKey
ALTER TABLE `User` DROP FOREIGN KEY `User_organizationId_fkey`;

-- AlterTable
ALTER TABLE `EmailSettings` DROP COLUMN `encryptedEmailAuthPassword`,
    ADD COLUMN `emailAuthPassword` VARCHAR(191) NOT NULL,
    MODIFY `organizationId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `EmpLeaveHistory` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `organizationId` VARCHAR(191) NOT NULL,
    MODIFY `employeeId` VARCHAR(191) NOT NULL,
    MODIFY `leaveTypeId` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `EmployeeLevel` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `organizationId` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `EmploymentStatus` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `organizationId` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `LeaveAllocation` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `employeeLevelId` VARCHAR(191) NOT NULL,
    MODIFY `leaveTypeId` VARCHAR(191) NOT NULL,
    MODIFY `organizationId` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `LeaveBalance` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `leaveTypeId` VARCHAR(191) NOT NULL,
    MODIFY `employeeId` VARCHAR(191) NOT NULL,
    MODIFY `createdBy` VARCHAR(191) NOT NULL,
    MODIFY `updatedBy` VARCHAR(191) NOT NULL,
    MODIFY `organizationId` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `LeaveType` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `createdBy` VARCHAR(191) NOT NULL,
    MODIFY `updatedBy` VARCHAR(191) NOT NULL,
    MODIFY `organizationId` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `Organization` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `User` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `organizationId` VARCHAR(191) NOT NULL,
    MODIFY `employmentStatusId` VARCHAR(191) NOT NULL,
    MODIFY `employeeLevelId` VARCHAR(191) NOT NULL,
    MODIFY `createdBy` VARCHAR(191) NOT NULL,
    MODIFY `updatedBy` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AddForeignKey
ALTER TABLE `EmailSettings` ADD CONSTRAINT `EmailSettings_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `Organization`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `Organization`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_employmentStatusId_fkey` FOREIGN KEY (`employmentStatusId`) REFERENCES `EmploymentStatus`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_employeeLevelId_fkey` FOREIGN KEY (`employeeLevelId`) REFERENCES `EmployeeLevel`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EmploymentStatus` ADD CONSTRAINT `EmploymentStatus_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `Organization`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EmployeeLevel` ADD CONSTRAINT `EmployeeLevel_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `Organization`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LeaveType` ADD CONSTRAINT `LeaveType_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `Organization`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LeaveAllocation` ADD CONSTRAINT `LeaveAllocation_employeeLevelId_fkey` FOREIGN KEY (`employeeLevelId`) REFERENCES `EmployeeLevel`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LeaveAllocation` ADD CONSTRAINT `LeaveAllocation_leaveTypeId_fkey` FOREIGN KEY (`leaveTypeId`) REFERENCES `LeaveType`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LeaveAllocation` ADD CONSTRAINT `LeaveAllocation_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `Organization`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EmpLeaveHistory` ADD CONSTRAINT `EmpLeaveHistory_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EmpLeaveHistory` ADD CONSTRAINT `EmpLeaveHistory_leaveTypeId_fkey` FOREIGN KEY (`leaveTypeId`) REFERENCES `LeaveType`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EmpLeaveHistory` ADD CONSTRAINT `EmpLeaveHistory_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `Organization`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LeaveBalance` ADD CONSTRAINT `LeaveBalance_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LeaveBalance` ADD CONSTRAINT `LeaveBalance_leaveTypeId_fkey` FOREIGN KEY (`leaveTypeId`) REFERENCES `LeaveType`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LeaveBalance` ADD CONSTRAINT `LeaveBalance_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `Organization`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
