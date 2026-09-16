const boletoservice = require("../services/boletoservice.cjs");

/**
 * Endpoint de callback do Santander (a URL cadastrada no workspace de
 * cobrança). TODO: a documentação técnica vai dizer exatamente como o
 * Santander assina essas notificações (normalmente um header tipo
 * X-Santander-Signature ou similar) - até lá, uso um segredo compartilhado
 * simples via query string/header como camada mínima de proteção, pra essa
 * rota não ficar 100% aberta.
 *
 * O nome dos campos do payload (nossoNumero, valorPago, dataPagamento)
 * também é um placeholder - ajustar assim que soubermos o formato real
 * enviado pelo banco.
 */
const receberNotificacao = async (req, res) => {
  const segredoEsperado = process.env.SANTANDER_WEBHOOK_SECRET;
  const segredoRecebido = req.headers["x-webhook-secret"] || req.query.secret;

  if (segredoEsperado && segredoRecebido !== segredoEsperado) {
    return res.status(401).json({ error: "Assinatura/segredo inválido" });
  }

  try {
    const { nossoNumero, bankNumber, paidValue, valorPago, paymentDate, dataPagamento, status } = req.body;

    // Santander pode notificar outros eventos além de pagamento (ex: registro, baixa) -
    // por ora só tratamos confirmação de pagamento; o resto fica logado pra análise.
    const evolucaoDePagamento = status ? ["PAID", "PAGO", "LIQUIDADO"].includes(String(status).toUpperCase()) : true;

    if (!evolucaoDePagamento) {
      console.log("Notificação Santander recebida (evento não tratado):", req.body);
      return res.status(200).json({ ok: true, ignorado: true });
    }

    const boleto = await boletoservice.registrarPagamento({
      nossoNumero: nossoNumero || bankNumber,
      valorPago: paidValue ?? valorPago,
      dataPagamento: paymentDate ?? dataPagamento ?? new Date().toISOString(),
    });

    return res.status(200).json({ ok: true, boletoid: boleto.boletoid });
  } catch (error) {
    console.error("Erro ao processar webhook Santander:", error);
    // Responder 200 mesmo em erro de negócio (ex: boleto não encontrado) evita que o banco
    // fique reenviando a notificação indefinidamente; o erro real fica no log pra investigar.
    return res.status(200).json({ ok: false, erro: error.message });
  }
};

module.exports = { receberNotificacao };
