const prisma = require("../../prisma/connection.cjs");

const read = async (req, res) => {
  try {
    const { clienteid, itemcobrancaid, competencia } = req.query;

    const leituras = await prisma.leituraConsumo.findMany({
      where: {
        clienteid: clienteid ? Number(clienteid) : undefined,
        itemcobrancaid: itemcobrancaid ? Number(itemcobrancaid) : undefined,
        competencia: competencia ? new Date(competencia) : undefined,
      },
      include: { ItemCobranca: { select: { nome: true, unidadeMedida: true } } },
      orderBy: { competencia: "desc" },
    });

    return res.json(leituras);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar leituras" });
  }
};

// Lança (ou corrige, via upsert) a leitura de um item medido numa unidade/competência.
// O consumo é sempre recalculado aqui, nunca aceito do cliente - evita leitura errada
// bater com o boleto.
const upsert = async (req, res) => {
  try {
    const { clienteid, itemcobrancaid, competencia, leituraAnterior, leituraAtual } = req.body;

    if (!clienteid || !itemcobrancaid || !competencia || leituraAnterior == null || leituraAtual == null) {
      return res.status(400).json({
        error: "clienteid, itemcobrancaid, competencia, leituraAnterior e leituraAtual são obrigatórios",
      });
    }

    if (Number(leituraAtual) < Number(leituraAnterior)) {
      return res.status(400).json({ error: "leituraAtual não pode ser menor que leituraAnterior" });
    }

    const consumo = Number(leituraAtual) - Number(leituraAnterior);

    const leitura = await prisma.leituraConsumo.upsert({
      where: {
        clienteid_itemcobrancaid_competencia: {
          clienteid: Number(clienteid),
          itemcobrancaid: Number(itemcobrancaid),
          competencia: new Date(competencia),
        },
      },
      update: { leituraAnterior, leituraAtual, consumo },
      create: {
        clienteid: Number(clienteid),
        itemcobrancaid: Number(itemcobrancaid),
        competencia: new Date(competencia),
        leituraAnterior,
        leituraAtual,
        consumo,
      },
    });

    return res.status(201).json(leitura);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao lançar leitura" });
  }
};

module.exports = { read, upsert };
