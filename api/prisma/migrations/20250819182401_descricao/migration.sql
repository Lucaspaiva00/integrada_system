-- DropForeignKey
ALTER TABLE `clientes` DROP FOREIGN KEY `Clientes_clienteid_fkey`;

-- AddForeignKey
ALTER TABLE `Clientes` ADD CONSTRAINT `Clientes_CondominioID_fkey` FOREIGN KEY (`CondominioID`) REFERENCES `Condominio`(`condominioid`) ON DELETE RESTRICT ON UPDATE CASCADE;
