const prisma = require("../../prisma/connection.cjs");

// Lista os itens de cobrança de um condomínio (o "cardápio" dele: taxa, gás, água...)
const read = async (req, res) => {
  try {
    const { condominioid } = req.query;

    const itens = await prisma.itemCobranca.findMany({
      where: condominioid ? { CondominioID: Number(condominioid) } : undefined,
      orderBy: { nome: "asc" },
    });

    return res.json(itens);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar itens de cobrança" });
  }
};

// Cria um item novo pro condomínio (ex: só o condomínio que tem gás cria a linha "Gás")
const create = async (req, res) => {
  try {
    const { CondominioID, nome, tipo, valorPadrao, valorPorUnidade, unidadeMedida, obrigatorio } = req.body;

    if (!CondominioID || !nome || !tipo) {
      return res.status(400).json({ error: "CondominioID, nome e tipo são obrigatórios" });
    }

    if (tipo === "FIXO" && valorPadrao == null) {
      return res.status(400).json({ error: "Itens do tipo FIXO precisam de valorPadrao" });
    }

    if (tipo === "MEDIDO" && valorPorUnidade == null) {
      return res.status(400).json({ error: "Itens do tipo MEDIDO precisam de valorPorUnidade" });
    }

    const item = await prisma.itemCobranca.create({
      data: {
        CondominioID: Number(CondominioID),
        nome,
        tipo,
        valorPadrao,
        valorPorUnidade,
        unidadeMedida,
        obrigatorio: obrigatorio ?? true,
      },
    });

    return res.status(201).json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao criar item de cobrança" });
  }
};

const update = async (req, res) => {
  try {
    const itemcobrancaid = Number(req.params.id);
    const { nome, valorPadrao, valorPorUnidade, unidadeMedida, obrigatorio, ativo } = req.body;

    const item = await prisma.itemCobranca.update({
      where: { itemcobrancaid },
      data: { nome, valorPadrao, valorPorUnidade, unidadeMedida, obrigatorio, ativo },
    });

    return res.json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao atualizar item de cobrança" });
  }
};

// Desativa em vez de apagar - se já tiver boleto emitido usando esse item, apagar quebraria o histórico
const desativar = async (req, res) => {
  try {
    const itemcobrancaid = Number(req.params.id);
    const item = await prisma.itemCobranca.update({ where: { itemcobrancaid }, data: { ativo: false } });
    return res.json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao desativar item de cobrança" });
  }
};

module.exports = { read, create, update, desativar };
