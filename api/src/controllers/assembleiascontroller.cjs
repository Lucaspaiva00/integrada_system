const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const BASE_URL = "https://integrada-api.onrender.com/documentos";

// 📋 Listar assembleias
const read = async (req, res) => {
  try {
    const assembleiasRaw = await prisma.assembleia.findMany({
      include: {
        Condominio: { select: { nomecondominio: true } },
      },
      orderBy: { assembleiaid: "desc" },
    });

    // Normaliza a saída para o front
    const assembleias = assembleiasRaw.map((a) => ({
      assembleiaid: a.assembleiaid,
      descricao: a.descricao,
      documento: a.documento,
      documentoUrl: a.documento
        ? `${BASE_URL}/assembleia/${encodeURIComponent(a.documento)}`
        : null,
      CondominioID: Number(a.CondominioID),
      nomeCondominio: a.Condominio?.nomecondominio || null,
      status: a.status || "Ativa",
    }));

    res.json(assembleias);
  } catch (error) {
    console.error("Erro ao listar assembleias:", error);
    res.status(500).json({ error: "Erro ao listar assembleias" });
  }
};

// 📤 Criar assembleia com upload de documento
const create = async (req, res) => {
  try {
    const { descricao, CondominioID } = req.body;

    if (!descricao || !CondominioID) {
      return res
        .status(400)
        .json({ error: "Descrição e condomínio são obrigatórios." });
    }

    if (!req.file) {
      return res.status(400).json({ error: "Arquivo não enviado." });
    }

    const novaAssembleia = await prisma.assembleia.create({
      data: {
        descricao,
        documento: req.file.filename,
        Condominio: { connect: { condominioid: Number(CondominioID) } },
      },
      include: {
        Condominio: { select: { nomecondominio: true } },
      },
    });

    const responseObj = {
      assembleiaid: novaAssembleia.assembleiaid,
      descricao: novaAssembleia.descricao,
      documento: novaAssembleia.documento,
      documentoUrl: novaAssembleia.documento
        ? `${BASE_URL}/assembleia/${encodeURIComponent(
            novaAssembleia.documento
          )}`
        : null,
      CondominioID: Number(novaAssembleia.CondominioID),
      nomeCondominio: novaAssembleia.Condominio?.nomecondominio || null,
      status: novaAssembleia.status || "Ativa",
    };

    res.status(201).json(responseObj);
  } catch (error) {
    console.error("Erro ao criar assembleia:", error);
    res.status(500).json({ error: "Erro ao criar assembleia" });
  }
};

module.exports = {
  read,
  create,
};
