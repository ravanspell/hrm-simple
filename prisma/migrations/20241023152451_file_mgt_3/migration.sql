/*
  Warnings:

  - You are about to alter the column `fileSize` on the `FileMgt` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.

*/
-- AlterTable
ALTER TABLE `FileMgt` MODIFY `fileSize` INTEGER NOT NULL;
