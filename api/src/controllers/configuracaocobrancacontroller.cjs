const prisma = require("../../prisma/connection.cjs");

const readByCondominio = async (req, res) => {
  try {
    const condominioid = Number(req.params.condominioid);
    const config = await prisma.configuracaoCobranca.findUnique({ where: { condominioid } });

    if (!config) return res.status(404).json({ error: "Condomínio ainda não tem configuração de cobrança" });
    return res.json(config);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar configuração de cobrança" });
  }
};

// Cria ou atualiza (upsert) - é comum a Juliana só querer "definir/corrigir" a config, não recriar do zero
const upsert = async (req, res) => {
  try {
    const condominioid = Number(req.params.condominioid);
    const data = req.body;

    const config = await prisma.configuracaoCobranca.upsert({
      where: { condominioid },
      update: {
        diaVencimento: data.diaVencimento,
        percentualMulta: data.percentualMulta,
        percentualJurosAoMes: data.percentualJurosAoMes,
        percentualDescontoAntecipado: data.percentualDescontoAntecipado,
        diasDescontoAntecipado: data.diasDescontoAntecipado,
        santanderWorkspaceId: data.santanderWorkspaceId,
        ativo: data.ativo,
      },
      create: {
        condominioid,
        diaVencimento: data.diaVencimento ?? 10,
        percentualMulta: data.percentualMulta ?? 2.0,
        percentualJurosAoMes: data.percentualJurosAoMes ?? 1.0,
        percentualDescontoAntecipado: data.percentualDescontoAntecipado ?? 0,
        diasDescontoAntecipado: data.diasDescontoAntecipado ?? 0,
        santanderWorkspaceId: data.santanderWorkspaceId,
        ativo: data.ativo ?? true,
      },
    });

    return res.json(config);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao salvar configuração de cobrança" });
  }
};

module.exports = { readByCondominio, upsert };
