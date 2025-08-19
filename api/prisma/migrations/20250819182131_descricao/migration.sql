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

-- AddForeignKey
ALTER TABLE `Clientes` ADD CONSTRAINT `Clientes_clienteid_fkey` FOREIGN KEY (`clienteid`) REFERENCES `Condominio`(`condominioid`) ON DELETE RESTRICT ON UPDATE CASCADE;
