/*
  Warnings:

  - You are about to drop the column `ClienteID` on the `assembleia` table. All the data in the column will be lost.
  - Added the required column `CondominioID` to the `assembleia` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `assembleia` DROP FOREIGN KEY `assembleia_ClienteID_fkey`;

-- DropIndex
DROP INDEX `assembleia_ClienteID_fkey` ON `assembleia`;

-- AlterTable
ALTER TABLE `assembleia` DROP COLUMN `ClienteID`,
    ADD COLUMN `CondominioID` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `assembleia` ADD CONSTRAINT `assembleia_CondominioID_fkey` FOREIGN KEY (`CondominioID`) REFERENCES `Condominio`(`condominioid`) ON DELETE RESTRICT ON UPDATE CASCADE;
