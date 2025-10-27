const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const read = async (req, res) => {
  try {
    const prestacoes = await prisma.prestacaoContas.findMany({
      include: { Condominio: true },
      orderBy: { mes: "desc" },
    });
    return res.json(prestacoes);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const create = async (req, res) => {
  try {
    const { mes, CondominioID } = req.body;
    const documento = req.file ? req.file.filename : null;

    if (!documento)
      return res.status(400).json({ error: "Nenhum arquivo enviado." });
    if (!CondominioID)
      return res.status(400).json({ error: "Condomínio não informado." });

    const prestacao = await prisma.prestacaoContas.create({
      data: {
        documento,
        mes: new Date(mes),
        CondominioID: parseInt(CondominioID),
      },
    });

    return res.status(201).json(prestacao);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

module.exports = {
  read,
  create,
};
