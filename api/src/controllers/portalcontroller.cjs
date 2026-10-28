const prisma = require("../../prisma/connection.cjs");
const profileSelect = {
  clienteid: true,
  nome: true,
  apartamento: true,
  CondominioID: true,
  Condominio: { select: { nomecondominio: true, condominioid: true } },
};
function profile(c) {
  return {
    clienteid: c.clienteid,
    nome: c.nome,
    apartamento: c.apartamento,
    condominioid: c.CondominioID,
    condominio: { nome: c.Condominio.nomecondominio },
  };
}
const run = (fn) => async (req, res) => {
  try {
    // Revalidate the relationship on every request, including after a unit is reassigned.
    const c = await prisma.clientes.findUnique({
      where: { clienteid: req.proprietario.clienteid },
      select: profileSelect,
    });
    if (!c || c.CondominioID !== req.proprietario.condominioid)
      return res.status(401).json({ error: "Entre novamente." });
    res.json(await fn(req, c));
  } catch (err) {
    console.error("Erro no portal:", err.message);
    res
      .status(500)
      .json({ error: "Não foi possível carregar. Tente novamente." });
  }
};
const me = run(async (_req, c) => profile(c));
const boletos = run(async (_req, c) =>
  prisma.boleto.findMany({
    where: { clienteid: c.clienteid },
    orderBy: { vencimento: "desc" },
    select: {
      boletoid: true,
      competencia: true,
      valorTotal: true,
      valorPago: true,
      dataPagamento: true,
      vencimento: true,
      status: true,
      linhaDigitavel: true,
      codigoBarras: true,
      qrCodePix: true,
      Itens: {
        select: {
          descricao: true,
          quantidade: true,
          valorUnitario: true,
          valorTotal: true,
        },
      },
    },
  }),
);
const comunicados = run(async (_req, c) =>
  prisma.comunicados.findMany({
    where: { CondominioID: c.CondominioID },
    orderBy: { comunicadosid: "desc" },
    select: {
      comunicadosid: true,
      datacomunicado: true,
      descricao: true,
      documento: true,
    },
  }),
);
const prestacoes = run(async (_req, c) =>
  prisma.prestacaoContas.findMany({
    where: { CondominioID: c.CondominioID },
    orderBy: { mes: "desc" },
    select: { prestacaoid: true, mes: true, documento: true },
  }),
);
const assembleias = run(async (_req, c) =>
  prisma.assembleia.findMany({
    where: { CondominioID: c.CondominioID },
    orderBy: { assembleiaid: "desc" },
    select: { assembleiaid: true, descricao: true, documento: true },
  }),
);
module.exports = { me, boletos, comunicados, prestacoes, assembleias, profile };
