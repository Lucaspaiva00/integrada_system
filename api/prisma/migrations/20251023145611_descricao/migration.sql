/*
  Warnings:

  - Added the required column `documento` to the `assembleia` table without a default value. This is not possible if the table is not empty.
  - Added the required column `CondominioID` to the `comunicados` table without a default value. This is not possible if the table is not empty.
  - Added the required column `documento` to the `comunicados` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `assembleia` DROP FOREIGN KEY `assembleia_CondominioID_fkey`;

-- DropIndex
DROP INDEX `assembleia_CondominioID_fkey` ON `assembleia`;

-- AlterTable
ALTER TABLE `assembleia` ADD COLUMN `documento` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `comunicados` ADD COLUMN `CondominioID` INTEGER NOT NULL,
    ADD COLUMN `documento` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `assembleia` ADD CONSTRAINT `assembleia_CondominioID_fkey` FOREIGN KEY (`CondominioID`) REFERENCES `Condominio`(`condominioid`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comunicados` ADD CONSTRAINT `comunicados_CondominioID_fkey` FOREIGN KEY (`CondominioID`) REFERENCES `Condominio`(`condominioid`) ON DELETE CASCADE ON UPDATE CASCADE;
