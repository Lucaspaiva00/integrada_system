const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Login do proprietário (Clientes)
const loginProprietario = async (req, res) => {
  const { apartamento, cpf } = req.body;

  if (!apartamento || !cpf) {
    return res
      .status(400)
      .json({ error: "Apartamento e CPF são obrigatórios." });
  }

  try {
    // Busca o cliente pelo apartamento
    const cliente = await prisma.clientes.findFirst({
      where: { apartamento },
      include: {
        Condominio: {
          select: { nomecondominio: true, condominioid: true },
        },
      },
    });

    if (!cliente) {
      return res.status(404).json({ error: "Apartamento não encontrado." });
    }

    // Pega apenas os últimos 4 dígitos do CPF real e compara
    const ultimosQuatro = cliente.cpf.slice(-4);
    if (ultimosQuatro !== cpf) {
      return res.status(401).json({ error: "CPF inválido." });
    }

    return res.status(200).json({
      message: "Login realizado com sucesso!",
      cliente: {
        nome: cliente.nome,
        apartamento: cliente.apartamento,
        condominio: cliente.Condominio.nomecondominio,
        condominioid: cliente.Condominio.condominioid,
        condominio: {
          nome: cliente.Condominio.nomecondominio,
          condominioid: cliente.Condominio.condominioid,
        },
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro no servidor." });
  }
};

module.exports = {
  loginProprietario,
};
