const prisma = require("../../prisma/connection.cjs");

const read = async (req, res) => {
  try {
    const clientes = await prisma.clientes.findMany({
      include: {
        Condominio: {
          select: {
            nomecondominio: true,
          },
        },
      },
    });
    return res.json(clientes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar clientes" });
  }
};

const create = async (req, res) => {
  try {
    const data = req.body;

    if (!data.telefone || !data.email) {
      return res
        .status(400)
        .json({ error: "Telefone e email são obrigatórios" });
    }

    const cliente = await prisma.clientes.create({
      data: {
        apartamento: data.apartamento,
        nome: data.nome,
        cpf: data.cpf,
        telefone: data.telefone,
        email: data.email,
        CondominioID: Number(data.CondominioID),
      },
      include: {
        Condominio: {
          select: {
            nomecondominio: true,
          },
        },
      },
    });

    res.status(201).json(cliente);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao criar cliente" });
  }
};

const update = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const data = req.body;

    if (!id) {
      return res.status(400).json({ error: "ID do cliente não informado." });
    }

    // monta objeto de atualização
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

    const cliente = await prisma.clientes.update({
      where: { clienteid: id },
      data: updateData,
      include: {
        Condominio: { select: { nomecondominio: true } },
      },
    });

    return res.status(200).json(cliente);
  } catch (error) {
    console.error("Erro ao atualizar cliente:", error);
    res.status(500).json({ error: "Erro ao atualizar cliente" });
  }
};

module.exports = {
  read,
  create,
  update,
};
