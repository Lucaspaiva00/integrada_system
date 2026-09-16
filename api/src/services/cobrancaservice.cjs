const prisma = require("../../prisma/connection.cjs");

/**
 * Monta a lista de itens que compõem o boleto de UMA unidade numa
 * competência (mês de referência). É aqui que as diferenças entre
 * condomínios (tem gás / não tem, valores diferentes de taxa, item extra só
 * pra algumas unidades) viram, de fato, linhas de cobrança - o resto do
 * sistema (boletoservice, santanderservice) não sabe nem precisa saber que
 * essas diferenças existem.
 *
 * Regras aplicadas:
 *  - Só entram itens do ItemCobranca.ativo = true do condomínio da unidade.
 *  - Item marcado obrigatorio = true entra pra todo mundo, a não ser que a
 *    unidade tenha um ClienteItemCobranca explícito com ativo = false.
 *  - Item obrigatorio = false só entra se a unidade tiver um
 *    ClienteItemCobranca com ativo = true (op-in).
 *  - Tipo FIXO usa valorPersonalizado (se existir) ou o valorPadrao do item.
 *  - Tipo MEDIDO exige uma LeituraConsumo da competência; sem leitura
 *    lançada, o item é pulado e um aviso é retornado (pra não travar a
 *    geração em lote de um condomínio inteiro por causa de 1 leitura faltando).
 *  - Tipo VARIAVEL só entra se vier um valor explícito em itensAvulsos.
 */
async function montarItensDoBoleto({ clienteid, competencia, itensAvulsos = [] }) {
  const cliente = await prisma.clientes.findUnique({
    where: { clienteid: Number(clienteid) },
  });

  if (!cliente) {
    throw new Error(`Cliente ${clienteid} não encontrado`);
  }

  const itensCatalogo = await prisma.itemCobranca.findMany({
    where: { CondominioID: cliente.CondominioID, ativo: true },
  });

  const vinculos = await prisma.clienteItemCobranca.findMany({
    where: { clienteid: cliente.clienteid },
  });
  const vinculoPorItem = new Map(vinculos.map((v) => [v.itemcobrancaid, v]));

  const itens = [];
  const avisos = [];

  for (const item of itensCatalogo) {
    const vinculo = vinculoPorItem.get(item.itemcobrancaid);

    // decide se o item entra pra essa unidade
    if (item.obrigatorio) {
      if (vinculo && vinculo.ativo === false) continue; // opt-out explícito
    } else {
      if (!vinculo || vinculo.ativo !== true) continue; // precisa de opt-in
    }

    if (item.tipo === "FIXO") {
      const valorUnitario = vinculo?.valorPersonalizado ?? item.valorPadrao;
      if (valorUnitario == null) {
        avisos.push(`Item "${item.nome}" não tem valorPadrao nem valorPersonalizado definido - pulado.`);
        continue;
      }
      itens.push({
        itemcobrancaid: item.itemcobrancaid,
        descricao: item.nome,
        quantidade: 1,
        valorUnitario,
        valorTotal: Number(valorUnitario),
      });
    }

    if (item.tipo === "MEDIDO") {
      const leitura = await prisma.leituraConsumo.findUnique({
        where: {
          clienteid_itemcobrancaid_competencia: {
            clienteid: cliente.clienteid,
            itemcobrancaid: item.itemcobrancaid,
            competencia: new Date(competencia),
          },
        },
      });

      if (!leitura) {
        avisos.push(`Sem leitura de "${item.nome}" para a competência informada - item não entrou no boleto.`);
        continue;
      }

      const tarifa = vinculo?.valorPersonalizado ?? item.valorPorUnidade;
      const valorTotal = Number(leitura.consumo) * Number(tarifa);

      itens.push({
        itemcobrancaid: item.itemcobrancaid,
        descricao: `${item.nome} (${leitura.consumo} ${item.unidadeMedida || ""})`.trim(),
        quantidade: leitura.consumo,
        valorUnitario: tarifa,
        valorTotal,
      });
    }

    if (item.tipo === "VARIAVEL") {
      const avulso = itensAvulsos.find((a) => a.itemcobrancaid === item.itemcobrancaid);
      if (!avulso) continue; // item variável sem valor informado simplesmente não entra
      itens.push({
        itemcobrancaid: item.itemcobrancaid,
        descricao: avulso.descricao || item.nome,
        quantidade: avulso.quantidade ?? 1,
        valorUnitario: avulso.valorUnitario,
        valorTotal: Number(avulso.valorUnitario) * Number(avulso.quantidade ?? 1),
      });
    }
  }

  // itens totalmente avulsos, que nem estão no catálogo (ex: multa de assembleia, rateio de obra)
  for (const avulso of itensAvulsos.filter((a) => !a.itemcobrancaid)) {
    itens.push({
      itemcobrancaid: null,
      descricao: avulso.descricao,
      quantidade: avulso.quantidade ?? 1,
      valorUnitario: avulso.valorUnitario,
      valorTotal: Number(avulso.valorUnitario) * Number(avulso.quantidade ?? 1),
    });
  }

  const valorTotal = itens.reduce((soma, i) => soma + i.valorTotal, 0);

  return { cliente, itens, valorTotal, avisos };
}

module.exports = { montarItensDoBoleto };
