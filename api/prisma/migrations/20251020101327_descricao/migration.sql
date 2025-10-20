-- CreateTable
CREATE TABLE `Condominio` (
    `condominioid` INTEGER NOT NULL AUTO_INCREMENT,
    `nomecondominio` VARCHAR(191) NOT NULL,
    `endereco` VARCHAR(191) NOT NULL,
    `telefone` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`condominioid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Clientes` (
    `clienteid` INTEGER NOT NULL AUTO_INCREMENT,
    `apartamento` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `cpf` VARCHAR(191) NOT NULL,
    `CondominioID` INTEGER NOT NULL,

    UNIQUE INDEX `Clientes_cpf_key`(`cpf`),
    PRIMARY KEY (`clienteid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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
    `datacomunicado` VARCHAR(191) NOT NULL,
    `descricao` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`comunicadosid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `prestacaocontas` (
    `pretacaoid` INTEGER NOT NULL AUTO_INCREMENT,
    `documento` VARCHAR(191) NOT NULL,
    `mes` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`pretacaoid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Clientes` ADD CONSTRAINT `Clientes_CondominioID_fkey` FOREIGN KEY (`CondominioID`) REFERENCES `Condominio`(`condominioid`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ocorrencias` ADD CONSTRAINT `ocorrencias_ClienteID_fkey` FOREIGN KEY (`ClienteID`) REFERENCES `Clientes`(`clienteid`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reservas` ADD CONSTRAINT `reservas_ClienteID_fkey` FOREIGN KEY (`ClienteID`) REFERENCES `Clientes`(`clienteid`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `assembleia` ADD CONSTRAINT `assembleia_ClienteID_fkey` FOREIGN KEY (`ClienteID`) REFERENCES `Clientes`(`clienteid`) ON DELETE RESTRICT ON UPDATE CASCADE;
