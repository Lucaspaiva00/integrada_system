-- CreateEnum
CREATE TYPE "public"."TipoItemCobranca" AS ENUM ('FIXO', 'MEDIDO', 'VARIAVEL');

-- CreateEnum
CREATE TYPE "public"."StatusBoleto" AS ENUM ('PENDENTE', 'REGISTRADO', 'PAGO', 'VENCIDO', 'CANCELADO', 'ERRO');

-- AlterTable
ALTER TABLE "public"."Clientes" ADD COLUMN     "bairro" TEXT,
ADD COLUMN     "cep" TEXT,
ADD COLUMN     "cidade" TEXT,
ADD COLUMN     "endereco" TEXT,
ADD COLUMN     "uf" TEXT;

-- CreateTable
CREATE TABLE "public"."ConfiguracaoCobranca" (
    "condominioid" INTEGER NOT NULL,
    "diaVencimento" INTEGER NOT NULL DEFAULT 10,
    "percentualMulta" DECIMAL(5,2) NOT NULL DEFAULT 2.0,
    "percentualJurosAoMes" DECIMAL(5,2) NOT NULL DEFAULT 1.0,
    "percentualDescontoAntecipado" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "diasDescontoAntecipado" INTEGER NOT NULL DEFAULT 0,
    "santanderWorkspaceId" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConfiguracaoCobranca_pkey" PRIMARY KEY ("condominioid")
);

-- CreateTable
CREATE TABLE "public"."ItemCobranca" (
    "itemcobrancaid" SERIAL NOT NULL,
    "CondominioID" INTEGER NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" "public"."TipoItemCobranca" NOT NULL,
    "valorPadrao" DECIMAL(10,2),
    "valorPorUnidade" DECIMAL(10,4),
    "unidadeMedida" TEXT,
    "obrigatorio" BOOLEAN NOT NULL DEFAULT true,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ItemCobranca_pkey" PRIMARY KEY ("itemcobrancaid")
);

-- CreateTable
CREATE TABLE "public"."ClienteItemCobranca" (
    "id" SERIAL NOT NULL,
    "clienteid" INTEGER NOT NULL,
    "itemcobrancaid" INTEGER NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "valorPersonalizado" DECIMAL(10,2),

    CONSTRAINT "ClienteItemCobranca_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LeituraConsumo" (
    "leituraid" SERIAL NOT NULL,
    "clienteid" INTEGER NOT NULL,
    "itemcobrancaid" INTEGER NOT NULL,
    "competencia" TIMESTAMP(3) NOT NULL,
    "leituraAnterior" DECIMAL(10,3) NOT NULL,
    "leituraAtual" DECIMAL(10,3) NOT NULL,
    "consumo" DECIMAL(10,3) NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeituraConsumo_pkey" PRIMARY KEY ("leituraid")
);

-- CreateTable
CREATE TABLE "public"."Boleto" (
    "boletoid" SERIAL NOT NULL,
    "clienteid" INTEGER NOT NULL,
    "competencia" TIMESTAMP(3) NOT NULL,
    "valorTotal" DECIMAL(10,2) NOT NULL,
    "valorPago" DECIMAL(10,2),
    "dataPagamento" TIMESTAMP(3),
    "vencimento" TIMESTAMP(3) NOT NULL,
    "status" "public"."StatusBoleto" NOT NULL DEFAULT 'PENDENTE',
    "percentualMulta" DECIMAL(5,2) NOT NULL,
    "percentualJurosAoMes" DECIMAL(5,2) NOT NULL,
    "nossoNumero" TEXT,
    "codigoBarras" TEXT,
    "linhaDigitavel" TEXT,
    "qrCodePix" TEXT,
    "workspaceId" TEXT,
    "respostaBanco" JSONB,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Boleto_pkey" PRIMARY KEY ("boletoid")
);

-- CreateTable
CREATE TABLE "public"."BoletoItem" (
    "boletoitemid" SERIAL NOT NULL,
    "boletoid" INTEGER NOT NULL,
    "itemcobrancaid" INTEGER,
    "descricao" TEXT NOT NULL,
    "quantidade" DECIMAL(10,3) NOT NULL DEFAULT 1,
    "valorUnitario" DECIMAL(10,4) NOT NULL,
    "valorTotal" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "BoletoItem_pkey" PRIMARY KEY ("boletoitemid")
);

-- CreateTable
CREATE TABLE "public"."BoletoHistorico" (
    "id" SERIAL NOT NULL,
    "boletoid" INTEGER NOT NULL,
    "statusAnterior" "public"."StatusBoleto",
    "statusNovo" "public"."StatusBoleto" NOT NULL,
    "origem" TEXT NOT NULL,
    "detalhe" JSONB,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BoletoHistorico_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ClienteItemCobranca_clienteid_itemcobrancaid_key" ON "public"."ClienteItemCobranca"("clienteid", "itemcobrancaid");

-- CreateIndex
CREATE UNIQUE INDEX "LeituraConsumo_clienteid_itemcobrancaid_competencia_key" ON "public"."LeituraConsumo"("clienteid", "itemcobrancaid", "competencia");

-- CreateIndex
CREATE UNIQUE INDEX "Boleto_nossoNumero_key" ON "public"."Boleto"("nossoNumero");

-- CreateIndex
CREATE UNIQUE INDEX "Boleto_clienteid_competencia_key" ON "public"."Boleto"("clienteid", "competencia");

-- AddForeignKey
ALTER TABLE "public"."ConfiguracaoCobranca" ADD CONSTRAINT "ConfiguracaoCobranca_condominioid_fkey" FOREIGN KEY ("condominioid") REFERENCES "public"."Condominio"("condominioid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ItemCobranca" ADD CONSTRAINT "ItemCobranca_CondominioID_fkey" FOREIGN KEY ("CondominioID") REFERENCES "public"."Condominio"("condominioid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ClienteItemCobranca" ADD CONSTRAINT "ClienteItemCobranca_clienteid_fkey" FOREIGN KEY ("clienteid") REFERENCES "public"."Clientes"("clienteid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ClienteItemCobranca" ADD CONSTRAINT "ClienteItemCobranca_itemcobrancaid_fkey" FOREIGN KEY ("itemcobrancaid") REFERENCES "public"."ItemCobranca"("itemcobrancaid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LeituraConsumo" ADD CONSTRAINT "LeituraConsumo_clienteid_fkey" FOREIGN KEY ("clienteid") REFERENCES "public"."Clientes"("clienteid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LeituraConsumo" ADD CONSTRAINT "LeituraConsumo_itemcobrancaid_fkey" FOREIGN KEY ("itemcobrancaid") REFERENCES "public"."ItemCobranca"("itemcobrancaid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Boleto" ADD CONSTRAINT "Boleto_clienteid_fkey" FOREIGN KEY ("clienteid") REFERENCES "public"."Clientes"("clienteid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BoletoItem" ADD CONSTRAINT "BoletoItem_boletoid_fkey" FOREIGN KEY ("boletoid") REFERENCES "public"."Boleto"("boletoid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BoletoItem" ADD CONSTRAINT "BoletoItem_itemcobrancaid_fkey" FOREIGN KEY ("itemcobrancaid") REFERENCES "public"."ItemCobranca"("itemcobrancaid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BoletoHistorico" ADD CONSTRAINT "BoletoHistorico_boletoid_fkey" FOREIGN KEY ("boletoid") REFERENCES "public"."Boleto"("boletoid") ON DELETE CASCADE ON UPDATE CASCADE;

