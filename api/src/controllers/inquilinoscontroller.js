const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 🔹 Lista todos os inquilinos com os nomes do condomínio e do proprietário
const read = async (req, res) => {
  try {
    const inquilinos = await prisma.inquilinos.findMany({
      include: {
        Condominio: { select: { nomecondominio: true } },
        Cliente: { select: { nome: true } }
      }
    });

    // Formata os dados pra ficar mais simples no front-end
    const formatado = inquilinos.map(i => ({
      id: i.inquilinosid,
      nome: i.nome,
      cpf: i.cpf,
      telefone: i.telefone,
      email: i.email,
      apartamento: i.apartamento,
      condominio: i.Condominio?.nomecondominio || "-",
      proprietario: i.Cliente?.nome || "-"
    }));

    return res.json(formatado);
  } catch (error) {
    console.error("Erro ao buscar inquilinos:", error);
    res.status(500).json({ error: "Erro ao buscar inquilinos" });
  }
};

// 🔹 Cria novo inquilino
const create = async (req, res) => {
  try {
    const data = req.body;

    // 🔍 Verifica se condomínio existe
    const condominio = await prisma.condominio.findUnique({
      where: { condominioid: data.CondominioID }
    });

    if (!condominio) {
      return res.status(400).json({ error: "Condomínio não encontrado" });
    }

    // 🔍 Verifica se proprietário existe
    const cliente = await prisma.clientes.findUnique({
      where: { clienteid: data.ClienteID }
    });

    if (!cliente) {
      return res.status(400).json({ error: "Proprietário não encontrado" });
    }

    // ✅ Cria o inquilino corretamente, conectando Condomínio e Cliente
    const inquilino = await prisma.inquilinos.create({
      data: {
        apartamento: data.apartamento,
        nome: data.nome,
        cpf: data.cpf,
        telefone: data.telefone,
        email: data.email,
        Condominio: { connect: { condominioid: data.CondominioID } },
        Cliente: { connect: { clienteid: data.ClienteID } }
      },
      include: {
        Condominio: { select: { nomecondominio: true } },
        Cliente: { select: { nome: true } }
      }
    });

    return res.status(201).json(inquilino);
  } catch (error) {
    console.error("Erro ao criar inquilino:", error);
    res.status(500).json({ error: "Erro ao cadastrar inquilino" });
  }
};

module.exports = { read, create };
