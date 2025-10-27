const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const read = async (req, res) => {
  const condominio = await prisma.condominio.findMany();
  return res.json(condominio);
};

const create = async (req, res) => {
  const data = req.body;
  let condominio = await prisma.condominio.create({
    data: data,
  });
  return res.status(201).json(condominio).end();
};

export { read, create };
