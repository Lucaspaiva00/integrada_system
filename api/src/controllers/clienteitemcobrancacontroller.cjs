const prisma = require("../../prisma/connection.cjs");

// Lista quais itens estão explicitamente configurados pra uma unidade
// (opt-outs de itens obrigatórios, opt-ins de itens opcionais, valores customizados)
const readByCliente = async (req, res) => {
  try {
    const clienteid = Number(req.params.clienteid);
    const vinculos = await prisma.clienteItemCobranca.findMany({
      where: { clienteid },
      include: { ItemCobranca: true },
    });
    return res.json(vinculos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar itens de cobrança da unidade" });
  }
};

// Upsert por (clienteid, itemcobrancaid): usado tanto pra ativar um item opcional
// numa unidade quanto pra desativar um item obrigatório só nela, ou customizar valor
const upsert = async (req, res) => {
  try {
    const { clienteid, itemcobrancaid, ativo, valorPersonalizado } = req.body;

    if (!clienteid || !itemcobrancaid) {
      return res.status(400).json({ error: "clienteid e itemcobrancaid são obrigatórios" });
    }

    const vinculo = await prisma.clienteItemCobranca.upsert({
      where: { clienteid_itemcobrancaid: { clienteid: Number(clienteid), itemcobrancaid: Number(itemcobrancaid) } },
      update: { ativo, valorPersonalizado },
      create: {
        clienteid: Number(clienteid),
        itemcobrancaid: Number(itemcobrancaid),
        ativo: ativo ?? true,
        valorPersonalizado,
      },
    });

    return res.json(vinculo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao salvar item de cobrança da unidade" });
  }
};

module.exports = { readByCliente, upsert };
