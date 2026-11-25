ALTER TABLE "Clientes" ADD COLUMN "boletoCodigoHash" TEXT;

CREATE TABLE "BoletoPDF" (
    "id" SERIAL NOT NULL,
    "clienteid" INTEGER NOT NULL,
    "condominioid" INTEGER NOT NULL,
    "competencia" DATE NOT NULL,
    "pdf" BYTEA NOT NULL,

    CONSTRAINT "BoletoPDF_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "BoletoPDF_clienteid_fkey" FOREIGN KEY ("clienteid")
        REFERENCES "Clientes"("clienteid") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "BoletoPDF_condominioid_fkey" FOREIGN KEY ("condominioid")
        REFERENCES "Condominio"("condominioid") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "BoletoPDF_condominioid_clienteid_competencia_key"
    ON "BoletoPDF"("condominioid", "clienteid", "competencia");
CREATE INDEX "BoletoPDF_clienteid_condominioid_idx" ON "BoletoPDF"("clienteid", "condominioid");
