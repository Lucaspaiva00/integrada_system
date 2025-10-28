const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const read = async (req, res) => {
  const condominio = await prisma.condominio.findMany();
  return res.json(condominio);
};

const create = async (req, res) => {
  const data = req.body;
  const condominio = await prisma.condominio.create({ data });
  return res.status(201).json(condominio);
};

// 🧩 Novo método para atualizar
const update = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const data = req.body;

    const condominio = await prisma.condominio.update({
      where: { condominioid: id },
      data: data,
    });

    return res.status(200).json(condominio);
  } catch (error) {
    console.error("Erro ao atualizar condomínio:", error);
    return res.status(500).json({ error: "Erro ao atualizar condomínio" });
  }
};

// 🔍 Busca os detalhes de um condomínio com seus proprietários e inquilinos
const readById = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const condominio = await prisma.condominio.findUnique({
      where: { condominioid: id },
      include: {
        Clientes: true,   // Proprietários
        Inquilinos: true, // Inquilinos
      },
    });

    if (!condominio) {
      return res.status(404).json({ error: "Condomínio não encontrado" });
    }

    res.json(condominio);
  } catch (error) {
    console.error("Erro ao buscar condomínio:", error);
    res.status(500).json({ error: "Erro ao buscar condomínio" });
  }
};


module.exports = {
  read,
  create,
  update, 
  readById,
};
