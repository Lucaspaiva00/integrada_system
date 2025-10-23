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
    `telefone` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `CondominioID` INTEGER NOT NULL,

    UNIQUE INDEX `Clientes_cpf_key`(`cpf`),
    PRIMARY KEY (`clienteid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Inquilinos` (
    `inquilinosid` INTEGER NOT NULL AUTO_INCREMENT,
    `apartamento` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `cpf` VARCHAR(191) NOT NULL,
    `telefone` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `CondominioID` INTEGER NOT NULL,
    `ClienteID` INTEGER NOT NULL,

    UNIQUE INDEX `Inquilinos_cpf_key`(`cpf`),
    PRIMARY KEY (`inquilinosid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `assembleia` (
    `assembleiaid` INTEGER NOT NULL AUTO_INCREMENT,
    `descricao` VARCHAR(191) NOT NULL,
    `CondominioID` INTEGER NOT NULL,

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
CREATE TABLE `PrestacaoContas` (
    `prestacaoid` INTEGER NOT NULL AUTO_INCREMENT,
    `documento` VARCHAR(191) NOT NULL,
    `mes` DATETIME(3) NOT NULL,
    `CondominioID` INTEGER NOT NULL,

    PRIMARY KEY (`prestacaoid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Clientes` ADD CONSTRAINT `Clientes_CondominioID_fkey` FOREIGN KEY (`CondominioID`) REFERENCES `Condominio`(`condominioid`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Inquilinos` ADD CONSTRAINT `Inquilinos_CondominioID_fkey` FOREIGN KEY (`CondominioID`) REFERENCES `Condominio`(`condominioid`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Inquilinos` ADD CONSTRAINT `Inquilinos_ClienteID_fkey` FOREIGN KEY (`ClienteID`) REFERENCES `Clientes`(`clienteid`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `assembleia` ADD CONSTRAINT `assembleia_CondominioID_fkey` FOREIGN KEY (`CondominioID`) REFERENCES `Condominio`(`condominioid`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PrestacaoContas` ADD CONSTRAINT `PrestacaoContas_CondominioID_fkey` FOREIGN KEY (`CondominioID`) REFERENCES `Condominio`(`condominioid`) ON DELETE RESTRICT ON UPDATE CASCADE;
