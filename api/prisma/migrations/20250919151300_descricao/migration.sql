-- CreateTable
CREATE TABLE `ocorrencias` (
    `ocorrenciasid` INTEGER NOT NULL AUTO_INCREMENT,
    `ClienteID` INTEGER NOT NULL,
    `descricao` VARCHAR(191) NOT NULL,
    `datacriado` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`ocorrenciasid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reservas` (
    `reservaid` INTEGER NOT NULL AUTO_INCREMENT,
    `ClienteID` INTEGER NOT NULL,
    `datareserva` VARCHAR(191) NOT NULL,
    `local` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`reservaid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `assembleia` (
    `assembleiaid` INTEGER NOT NULL AUTO_INCREMENT,
    `ClienteID` INTEGER NOT NULL,
    `descricao` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`assembleiaid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `comunicados` (
    `comunicadosid` INTEGER NOT NULL AUTO_INCREMENT,
    `ClienteID` INTEGER NOT NULL,
    `datacomunicado` VARCHAR(191) NOT NULL,
    `descricao` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`comunicadosid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `prestacaocontas` (
    `pretacaoid` INTEGER NOT NULL AUTO_INCREMENT,
    `demonstrativo` VARCHAR(191) NOT NULL,
    `datacriado` VARCHAR(191) NOT NULL,
    `ClienteID` INTEGER NOT NULL,

    PRIMARY KEY (`pretacaoid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ocorrencias` ADD CONSTRAINT `ocorrencias_ClienteID_fkey` FOREIGN KEY (`ClienteID`) REFERENCES `Clientes`(`clienteid`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reservas` ADD CONSTRAINT `reservas_ClienteID_fkey` FOREIGN KEY (`ClienteID`) REFERENCES `Clientes`(`clienteid`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `assembleia` ADD CONSTRAINT `assembleia_ClienteID_fkey` FOREIGN KEY (`ClienteID`) REFERENCES `Clientes`(`clienteid`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comunicados` ADD CONSTRAINT `comunicados_ClienteID_fkey` FOREIGN KEY (`ClienteID`) REFERENCES `Clientes`(`clienteid`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `prestacaocontas` ADD CONSTRAINT `prestacaocontas_ClienteID_fkey` FOREIGN KEY (`ClienteID`) REFERENCES `Clientes`(`clienteid`) ON DELETE RESTRICT ON UPDATE CASCADE;
