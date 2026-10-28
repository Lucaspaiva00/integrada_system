const { issue } = require('../security/proprietario.cjs');
const prisma = require("../../prisma/connection.cjs");

// Login do proprietário (Clientes)
const loginProprietario = async (req, res) => {
  const { apartamento, cpf } = req.body || {};

  if (typeof apartamento !== 'string' || !apartamento.trim() || apartamento.length > 100 || typeof cpf !== 'string' || !/^\d{4}$/.test(cpf)) {
    return res
      .status(400)
      .json({ error: "Apartamento e CPF são obrigatórios." });
  }

  try {
    // Resolve repeated apartment numbers without choosing another condominium by accident.
    const cliente = await prisma.clientes.findMany({
      where: { apartamento: apartamento.trim() },
      select: { clienteid: true, nome: true, apartamento: true, cpf: true,
        Condominio: {
          select: { nomecondominio: true, condominioid: true },
        },
      },
    });

    const matches = cliente.filter(c => String(c.cpf).replace(/\D/g, '').slice(-4) === cpf);
    if (matches.length !== 1) {
      return res.status(401).json({ error: "Imóvel ou CPF inválido. Se persistir, contate a administradora." });
    }
    const owner = matches[0];
    return res.status(200).json({
      message: "Login realizado com sucesso!",
      token: issue(owner.clienteid, owner.Condominio.condominioid),
      cliente: {
        clienteid: owner.clienteid,
        nome: owner.nome,
        apartamento: owner.apartamento,
        condominioid: owner.Condominio.condominioid,
        condominio: {
          nome: owner.Condominio.nomecondominio,
          condominioid: owner.Condominio.condominioid,
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
