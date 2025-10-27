const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const path = require("path");

const read = async (req, res) => {
  try {
    const assembleias = await prisma.assembleia.findMany({
      include: {
        Condominio: { select: { nomecondominio: true } },
      },
      orderBy: { assembleiaid: "desc" },
    });
    return res.json(assembleias);
  } catch (error) {
    console.error("Erro ao listar assembleias:", error);
    res.status(500).json({ error: "Erro ao listar assembleias" });
  }
};

const create = async (req, res) => {
  try {
    const { descricao, CondominioID } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: "Arquivo não enviado" });
    }

    const novo = await prisma.assembleia.create({
      data: {
        descricao,
        documento: req.file.filename, // nome do arquivo
        Condominio: { connect: { condominioid: Number(CondominioID) } },
      },
      include: {
        Condominio: { select: { nomecondominio: true } },
      },
    });

    res.status(201).json(novo);
  } catch (error) {
    console.error("Erro ao criar assembleia:", error);
    res.status(500).json({ error: "Erro ao criar assembleia" });
  }
};

export { read, create };
