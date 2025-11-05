const prisma = require("../../prisma/connection.cjs");

// 🔹 Lista todos os inquilinos com os nomes do condomínio e do proprietário
const read = async (req, res) => {
  try {
    const inquilinos = await prisma.inquilinos.findMany({
      include: {
        Condominio: { select: { nomecondominio: true, condominioid: true } },
        Cliente: { select: { nome: true, clienteid: true } },
      },
      orderBy: { inquilinosid: "asc" },
    });

    const formatado = inquilinos.map((i) => ({
      id: i.inquilinosid,
      apartamento: i.apartamento,
      nome: i.nome,
      cpf: i.cpf,
      telefone: i.telefone,
      email: i.email,
      condominioId: i.Condominio?.condominioid || null,
      condominioNome: i.Condominio?.nomecondominio || "-",
      proprietarioId: i.Cliente?.clienteid || null,
      proprietarioNome: i.Cliente?.nome || "-",
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

    // validações básicas
    if (!data.nome || !data.cpf || !data.apartamento) {
      return res.status(400).json({ error: "Dados obrigatórios ausentes." });
    }
    if (!data.CondominioID) {
      return res.status(400).json({ error: "Condomínio não informado." });
    }
    if (!data.ClienteID) {
      return res.status(400).json({ error: "Proprietário não informado." });
    }

    const inquilino = await prisma.inquilinos.create({
      data: {
        apartamento: data.apartamento,
        nome: data.nome,
        cpf: data.cpf,
        telefone: data.telefone,
        email: data.email,
        Condominio: { connect: { condominioid: Number(data.CondominioID) } },
        Cliente: { connect: { clienteid: Number(data.ClienteID) } },
      },
      include: {
        Condominio: { select: { nomecondominio: true, condominioid: true } },
        Cliente: { select: { nome: true, clienteid: true } },
      },
    });

    return res.status(201).json(inquilino);
  } catch (error) {
    console.error("Erro ao criar inquilino:", error);
    res.status(500).json({ error: "Erro ao cadastrar inquilino" });
  }
};

// 🔁 Atualiza um inquilino existente
const update = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const data = req.body;

    // validações mínimas
    if (!id) {
      return res.status(400).json({ error: "ID do inquilino não informado." });
    }

    // IMPORTANTE:
    // Atualização de relações (Condominio / Cliente) precisa usar connect apenas se vier novo ID
    const updateData = {
      apartamento: data.apartamento,
      nome: data.nome,
      cpf: data.cpf,
      telefone: data.telefone,
      email: data.email,
    };

    if (data.CondominioID) {
      updateData.Condominio = {
        connect: { condominioid: Number(data.CondominioID) },
      };
    }

    if (data.ClienteID) {
      updateData.Cliente = {
        connect: { clienteid: Number(data.ClienteID) },
      };
    }

    const atualizado = await prisma.inquilinos.update({
      where: { inquilinosid: id },
      data: updateData,
      include: {
        Condominio: { select: { nomecondominio: true, condominioid: true } },
        Cliente: { select: { nome: true, clienteid: true } },
      },
    });

    return res.status(200).json(atualizado);
  } catch (error) {
    console.error("Erro ao atualizar inquilino:", error);
    res.status(500).json({ error: "Erro ao atualizar inquilino" });
  }
};

module.exports = {
  read,
  create,
  update,
};
