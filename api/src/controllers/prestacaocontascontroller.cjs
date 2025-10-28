const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const BASE_URL = "https://integrada-api.onrender.com/documentos";

// GET /prestacaocontascontroller
const read = async (req, res) => {
  try {
    const prestacoesRaw = await prisma.prestacaoContas.findMany({
      include: {
        Condominio: { select: { nomecondominio: true } },
      },
      orderBy: { mes: "desc" },
    });

    const prestacoes = prestacoesRaw.map((p) => {
      return {
        prestacaoid: p.prestacaoid,
        // deixa o Date original pra você poder montar o mês no front
        mes: p.mes,
        // nome do arquivo físico
        documento: p.documento,
        // URL pronta pra abrir
        documentoUrl: p.documento
          ? `${BASE_URL}/prestacoes/${encodeURIComponent(p.documento)}`
          : null,
        // ID numérico do condomínio dono dessa prestação
        CondominioID: Number(p.CondominioID),
        // nome bonitinho do condomínio (pra listar no admin)
        nomeCondominio: p.Condominio?.nomecondominio || null,
      };
    });

    return res.json(prestacoes);
  } catch (err) {
    console.error("Erro ao listar prestações:", err);
    return res.status(500).json({ error: "Erro ao listar prestações de contas" });
  }
};

// POST /prestacaocontascontroller
const create = async (req, res) => {
  try {
    const { mes, CondominioID } = req.body;
    const documento = req.file ? req.file.filename : null;

    if (!documento) {
      return res.status(400).json({ error: "Nenhum arquivo enviado." });
    }
    if (!CondominioID) {
      return res.status(400).json({ error: "Condomínio não informado." });
    }
    if (!mes) {
      return res.status(400).json({ error: "Mês não informado." });
    }

    const prestacao = await prisma.prestacaoContas.create({
      data: {
        documento,
        mes: new Date(mes), // ex: "2025-10-01"
        CondominioID: Number(CondominioID),
      },
      include: {
        Condominio: { select: { nomecondominio: true } },
      },
    });

    const responseObj = {
      prestacaoid: prestacao.prestacaoid,
      mes: prestacao.mes,
      documento: prestacao.documento,
      documentoUrl: prestacao.documento
        ? `${BASE_URL}/prestacoes/${encodeURIComponent(prestacao.documento)}`
        : null,
      CondominioID: Number(prestacao.CondominioID),
      nomeCondominio: prestacao.Condominio?.nomecondominio || null,
    };

    return res.status(201).json(responseObj);
  } catch (err) {
    console.error("Erro ao criar prestação:", err);
    return res.status(500).json({ error: "Erro ao criar prestação de contas" });
  }
};

module.exports = {
  read,
  create,
};
