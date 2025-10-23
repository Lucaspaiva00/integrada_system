-- CreateTable
CREATE TABLE "public"."Condominio" (
    "condominioid" SERIAL NOT NULL,
    "nomecondominio" TEXT NOT NULL,
    "endereco" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,

    CONSTRAINT "Condominio_pkey" PRIMARY KEY ("condominioid")
);

-- CreateTable
CREATE TABLE "public"."Clientes" (
    "clienteid" SERIAL NOT NULL,
    "apartamento" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "CondominioID" INTEGER NOT NULL,

    CONSTRAINT "Clientes_pkey" PRIMARY KEY ("clienteid")
);

-- CreateTable
CREATE TABLE "public"."Inquilinos" (
    "inquilinosid" SERIAL NOT NULL,
    "apartamento" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "CondominioID" INTEGER NOT NULL,
    "ClienteID" INTEGER NOT NULL,

    CONSTRAINT "Inquilinos_pkey" PRIMARY KEY ("inquilinosid")
);

-- CreateTable
CREATE TABLE "public"."assembleia" (
    "assembleiaid" SERIAL NOT NULL,
    "descricao" TEXT NOT NULL,
    "documento" TEXT NOT NULL,
    "CondominioID" INTEGER NOT NULL,

    CONSTRAINT "assembleia_pkey" PRIMARY KEY ("assembleiaid")
);

-- CreateTable
CREATE TABLE "public"."comunicados" (
    "comunicadosid" SERIAL NOT NULL,
    "datacomunicado" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "documento" TEXT NOT NULL,
    "CondominioID" INTEGER NOT NULL,

    CONSTRAINT "comunicados_pkey" PRIMARY KEY ("comunicadosid")
);

-- CreateTable
CREATE TABLE "public"."PrestacaoContas" (
    "prestacaoid" SERIAL NOT NULL,
    "documento" TEXT NOT NULL,
    "mes" TIMESTAMP(3) NOT NULL,
    "CondominioID" INTEGER NOT NULL,

    CONSTRAINT "PrestacaoContas_pkey" PRIMARY KEY ("prestacaoid")
);

-- CreateIndex
CREATE UNIQUE INDEX "Clientes_cpf_key" ON "public"."Clientes"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "Inquilinos_cpf_key" ON "public"."Inquilinos"("cpf");

-- AddForeignKey
ALTER TABLE "public"."Clientes" ADD CONSTRAINT "Clientes_CondominioID_fkey" FOREIGN KEY ("CondominioID") REFERENCES "public"."Condominio"("condominioid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Inquilinos" ADD CONSTRAINT "Inquilinos_CondominioID_fkey" FOREIGN KEY ("CondominioID") REFERENCES "public"."Condominio"("condominioid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Inquilinos" ADD CONSTRAINT "Inquilinos_ClienteID_fkey" FOREIGN KEY ("ClienteID") REFERENCES "public"."Clientes"("clienteid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."assembleia" ADD CONSTRAINT "assembleia_CondominioID_fkey" FOREIGN KEY ("CondominioID") REFERENCES "public"."Condominio"("condominioid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."comunicados" ADD CONSTRAINT "comunicados_CondominioID_fkey" FOREIGN KEY ("CondominioID") REFERENCES "public"."Condominio"("condominioid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PrestacaoContas" ADD CONSTRAINT "PrestacaoContas_CondominioID_fkey" FOREIGN KEY ("CondominioID") REFERENCES "public"."Condominio"("condominioid") ON DELETE RESTRICT ON UPDATE CASCADE;
