const prisma = require("../../prisma/connection.cjs");
const boletoservice = require("../services/boletoservice.cjs");

// Lista boletos, com filtros opcionais por cliente, condominio, competencia e status
const read = async (req, res) => {
  try {
    const { clienteid, condominioid, competencia, status } = req.query;

    const boletos = await prisma.boleto.findMany({
      where: {
        clienteid: clienteid ? Number(clienteid) : undefined,
        status: status || undefined,
        competencia: competencia ? new Date(competencia) : undefined,
        Cliente: condominioid ? { CondominioID: Number(condominioid) } : undefined,
      },
      include: {
        Cliente: { select: { nome: true, apartamento: true, CondominioID: true } },
        Itens: true,
      },
      orderBy: { vencimento: "desc" },
    });

    return res.json(boletos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar boletos" });
  }
};

const readById = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const boleto = await prisma.boleto.findUnique({
      where: { boletoid: id },
      include: { Cliente: true, Itens: true, Historico: { orderBy: { criadoEm: "desc" } } },
    });

    if (!boleto) return res.status(404).json({ error: "Boleto não encontrado" });
    return res.json(boleto);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar boleto" });
  }
};

// Gera o boleto de UMA unidade para uma competência específica
const create = async (req, res) => {
  const { clienteid, competencia, itensAvulsos } = req.body;

  if (!clienteid || !competencia) {
    return res.status(400).json({ error: "clienteid e competencia são obrigatórios" });
  }

  try {
    const { boleto, avisos } = await boletoservice.criarBoletoUnidade({ clienteid, competencia, itensAvulsos });
    return res.status(201).json({ boleto, avisos });
  } catch (error) {
    console.error("Erro ao criar boleto:", error?.detalhe || error);
    return res.status(error.boletoid ? 502 : 400).json({
      error: error.message,
      detalhe: error.detalhe,
      boletoid: error.boletoid,
    });
  }
};

// Gera os boletos de TODAS as unidades de um condomínio numa competência
const gerarLote = async (req, res) => {
  const { condominioid, competencia } = req.body;

  if (!condominioid || !competencia) {
    return res.status(400).json({ error: "condominioid e competencia são obrigatórios" });
  }

  try {
    const resultados = await boletoservice.gerarBoletosDoCondominio({ condominioId: condominioid, competencia });
    const sucesso = resultados.filter((r) => r.ok).length;
    return res.status(207).json({ total: resultados.length, sucesso, falhas: resultados.length - sucesso, resultados });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao gerar boletos em lote" });
  }
};

const sincronizarStatus = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const boleto = await prisma.boleto.findUnique({ where: { boletoid: id } });

    if (!boleto || !boleto.nossoNumero) {
      return res.status(404).json({ error: "Boleto não encontrado ou nunca registrado no banco" });
    }

    const santander = require("../services/santanderservice.cjs");
    const situacao = await santander.consultarBoleto({ workspaceId: boleto.workspaceId, nossoNumero: boleto.nossoNumero });

    const boletoAtualizado = await prisma.boleto.update({
      where: { boletoid: id },
      data: { respostaBanco: situacao },
    });

    return res.json(boletoAtualizado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao consultar status no Santander" });
  }
};

const cancelar = async (req, res) => {
  try {
    const boleto = await boletoservice.cancelarBoletoUnidade(req.params.id);
    return res.json(boleto);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  read,
  readById,
  create,
  gerarLote,
  sincronizarStatus,
  cancelar,
};
