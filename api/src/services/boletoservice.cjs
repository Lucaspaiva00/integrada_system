const prisma = require("../../prisma/connection.cjs");
const santander = require("./santanderservice.cjs");
const { montarItensDoBoleto } = require("./cobrancaservice.cjs");

function formatarDataISO(data) {
  return new Date(data).toISOString().slice(0, 10);
}

function calcularVencimento(competencia, diaVencimento) {
  const data = new Date(competencia);
  return new Date(data.getFullYear(), data.getMonth(), diaVencimento);
}

async function registrarHistorico(boletoid, statusAnterior, statusNovo, origem, detalhe) {
  await prisma.boletoHistorico.create({
    data: { boletoid, statusAnterior, statusNovo, origem, detalhe: detalhe ?? undefined },
  });
}

/**
 * Cria e registra o boleto de UMA unidade para uma competência.
 * Lança erro se já existir boleto pra essa unidade+competência (o schema
 * garante isso via @@unique, mas checamos antes pra dar uma mensagem clara).
 */
async function criarBoletoUnidade({ clienteid, competencia, itensAvulsos }) {
  const cliente = await prisma.clientes.findUnique({
    where: { clienteid: Number(clienteid) },
    include: { Condominio: { include: { ConfiguracaoCobranca: true } } },
  });

  if (!cliente) throw new Error("Cliente não encontrado");

  const config = cliente.Condominio.ConfiguracaoCobranca;
  if (!config || !config.ativo) {
    throw new Error(
      `Condomínio "${cliente.Condominio.nomecondominio}" não tem ConfiguracaoCobranca ativa. Cadastre-a antes de gerar boletos.`
    );
  }

  const jaExiste = await prisma.boleto.findUnique({
    where: { clienteid_competencia: { clienteid: cliente.clienteid, competencia: new Date(competencia) } },
  });
  if (jaExiste) {
    throw new Error(`Já existe boleto para esta unidade nesta competência (boletoid ${jaExiste.boletoid})`);
  }

  const { itens, valorTotal, avisos } = await montarItensDoBoleto({ clienteid, competencia, itensAvulsos });

  if (itens.length === 0) {
    throw new Error("Nenhum item de cobrança se aplica a esta unidade nesta competência - boleto não gerado.");
  }

  const vencimento = calcularVencimento(competencia, config.diaVencimento);
  const workspaceId = config.santanderWorkspaceId || process.env.SANTANDER_WORKSPACE_ID_PADRAO;

  if (!workspaceId) {
    throw new Error(
      `Condomínio "${cliente.Condominio.nomecondominio}" não tem workspace do Santander configurado (nem próprio, nem padrão).`
    );
  }

  // 1) grava local primeiro - nunca perdemos o lançamento se o banco falhar
  const boleto = await prisma.boleto.create({
    data: {
      clienteid: cliente.clienteid,
      competencia: new Date(competencia),
      vencimento,
      valorTotal,
      status: "PENDENTE",
      percentualMulta: config.percentualMulta,
      percentualJurosAoMes: config.percentualJurosAoMes,
      workspaceId,
      Itens: { create: itens },
    },
    include: { Itens: true },
  });

  await registrarHistorico(boleto.boletoid, null, "PENDENTE", "geracao", { avisos });

  // 2) tenta registrar no banco
  const nossoNumero = String(boleto.boletoid).padStart(11, "0");

  try {
    const respostaBanco = await santander.registrarBoleto({
      workspaceId,
      nossoNumero,
      valor: valorTotal,
      vencimento: formatarDataISO(vencimento),
      percentualMulta: config.percentualMulta,
      percentualJurosAoMes: config.percentualJurosAoMes,
      pagador: {
        nome: cliente.nome,
        cpf: cliente.cpf,
        endereco: cliente.endereco || "",
        bairro: cliente.bairro || "",
        cidade: cliente.cidade || "",
        uf: cliente.uf || "",
        cep: cliente.cep || "",
      },
    });

    const boletoAtualizado = await prisma.boleto.update({
      where: { boletoid: boleto.boletoid },
      data: {
        status: "REGISTRADO",
        nossoNumero,
        codigoBarras: respostaBanco.barCode || respostaBanco.barcode,
        linhaDigitavel: respostaBanco.digitableLine,
        qrCodePix: respostaBanco.qrCodePix || respostaBanco.pixQrCode,
        respostaBanco,
      },
      include: { Itens: true },
    });

    await registrarHistorico(boleto.boletoid, "PENDENTE", "REGISTRADO", "geracao", null);

    return { boleto: boletoAtualizado, avisos };
  } catch (error) {
    const detalhe = error?.response?.data || { message: error.message };

    await prisma.boleto.update({ where: { boletoid: boleto.boletoid }, data: { status: "ERRO", respostaBanco: detalhe } });
    await registrarHistorico(boleto.boletoid, "PENDENTE", "ERRO", "geracao", detalhe);

    const erroFinal = new Error("Boleto salvo localmente, mas o registro no Santander falhou.");
    erroFinal.detalhe = detalhe;
    erroFinal.boletoid = boleto.boletoid;
    throw erroFinal;
  }
}

/**
 * Gera os boletos de TODAS as unidades ativas de um condomínio para uma
 * competência. Roda unidade por unidade e não interrompe o lote se uma
 * unidade falhar (ex: sem leitura de água lançada) - devolve um resumo com
 * sucesso/erro de cada uma pra Juliana revisar o que precisa de atenção.
 */
async function gerarBoletosDoCondominio({ condominioId, competencia }) {
  const clientes = await prisma.clientes.findMany({ where: { CondominioID: Number(condominioId) } });

  const resultados = [];

  for (const cliente of clientes) {
    try {
      const { boleto, avisos } = await criarBoletoUnidade({ clienteid: cliente.clienteid, competencia });
      resultados.push({ clienteid: cliente.clienteid, apartamento: cliente.apartamento, ok: true, boletoid: boleto.boletoid, avisos });
    } catch (error) {
      resultados.push({ clienteid: cliente.clienteid, apartamento: cliente.apartamento, ok: false, erro: error.message, detalhe: error.detalhe });
    }
  }

  return resultados;
}

/**
 * Aplica a confirmação de pagamento vinda do webhook do Santander (ou de
 * uma sincronização manual). Idempotente: se o boleto já estava PAGO, não
 * duplica histórico.
 */
async function registrarPagamento({ nossoNumero, valorPago, dataPagamento, origem = "webhook_santander" }) {
  const boleto = await prisma.boleto.findUnique({ where: { nossoNumero } });
  if (!boleto) throw new Error(`Nenhum boleto encontrado com nossoNumero ${nossoNumero}`);
  if (boleto.status === "PAGO") return boleto;

  const boletoAtualizado = await prisma.boleto.update({
    where: { boletoid: boleto.boletoid },
    data: { status: "PAGO", valorPago, dataPagamento: new Date(dataPagamento) },
  });

  await registrarHistorico(boleto.boletoid, boleto.status, "PAGO", origem, { valorPago, dataPagamento });

  return boletoAtualizado;
}

async function cancelarBoletoUnidade(boletoid) {
  const boleto = await prisma.boleto.findUnique({ where: { boletoid: Number(boletoid) } });
  if (!boleto) throw new Error("Boleto não encontrado");
  if (boleto.status === "PAGO") throw new Error("Boleto já pago não pode ser cancelado");

  if (boleto.nossoNumero) {
    await santander.cancelarBoleto({ workspaceId: boleto.workspaceId, nossoNumero: boleto.nossoNumero });
  }

  const boletoAtualizado = await prisma.boleto.update({
    where: { boletoid: boleto.boletoid },
    data: { status: "CANCELADO" },
  });

  await registrarHistorico(boleto.boletoid, boleto.status, "CANCELADO", "admin", null);

  return boletoAtualizado;
}

module.exports = {
  criarBoletoUnidade,
  gerarBoletosDoCondominio,
  registrarPagamento,
  cancelarBoletoUnidade,
};
