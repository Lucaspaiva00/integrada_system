const fs = require("fs");
const https = require("https");
const axios = require("axios");

/**
 * Integração com a API de Cobrança do Santander.
 *
 * A API do Santander exige autenticação mTLS (certificado de cliente) em
 * TODAS as chamadas, inclusive na de obtenção de token. O client_id/secret e
 * o certificado são únicos por aplicação (ficam no .env); o `workspaceId`
 * varia por chamada porque cada condomínio pode ter seu próprio convênio de
 * cobrança (ver ConfiguracaoCobranca no schema).
 *
 * Variáveis de ambiente esperadas (ver .env.example):
 *  - SANTANDER_API_BASE_URL
 *  - SANTANDER_CLIENT_ID / SANTANDER_CLIENT_SECRET
 *  - SANTANDER_CERT_PATH / SANTANDER_CERT_PASSPHRASE (e SANTANDER_CERT_KEY_PATH se .pem)
 *  - SANTANDER_WORKSPACE_ID_PADRAO (fallback, usado só se o condomínio não tiver workspace próprio configurado)
 */

let cachedToken = null; // { access_token, expiresAt }
let cachedAgent = null;

function getHttpsAgent() {
  if (cachedAgent) return cachedAgent;

  const certPath = process.env.SANTANDER_CERT_PATH;

  if (!certPath || !fs.existsSync(certPath)) {
    throw new Error(
      "Certificado do Santander não encontrado. Configure SANTANDER_CERT_PATH no .env."
    );
  }

  const isPfx = certPath.toLowerCase().endsWith(".pfx") || certPath.toLowerCase().endsWith(".p12");

  cachedAgent = isPfx
    ? new https.Agent({
        pfx: fs.readFileSync(certPath),
        passphrase: process.env.SANTANDER_CERT_PASSPHRASE,
      })
    : new https.Agent({
        cert: fs.readFileSync(certPath),
        key: fs.readFileSync(process.env.SANTANDER_CERT_KEY_PATH),
        passphrase: process.env.SANTANDER_CERT_PASSPHRASE,
      });

  return cachedAgent;
}

function getClient() {
  return axios.create({
    baseURL: process.env.SANTANDER_API_BASE_URL,
    httpsAgent: getHttpsAgent(),
    timeout: 15000,
  });
}

/**
 * Obtém (ou reaproveita, se ainda válido) o token OAuth2 client_credentials.
 * TODO: confirmar com a documentação assinada se o endpoint é
 * "/auth/oauth/v2/token" e o formato exato de envio das credenciais - isso
 * varia um pouco entre as versões da API de Cobrança do Santander.
 */
async function getToken() {
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.access_token;
  }

  const client = getClient();

  const params = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: process.env.SANTANDER_CLIENT_ID,
    client_secret: process.env.SANTANDER_CLIENT_SECRET,
  });

  const { data } = await client.post("/auth/oauth/v2/token", params, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  cachedToken = {
    access_token: data.access_token,
    expiresAt: Date.now() + (Number(data.expires_in) - 30) * 1000, // 30s de margem
  };

  return cachedToken.access_token;
}

function headersAutenticados(token) {
  return {
    "X-Application-Key": process.env.SANTANDER_CLIENT_ID,
    Authorization: `Bearer ${token}`,
  };
}

/**
 * Registra um boleto na API de Cobrança.
 * O corpo exato exigido pelo Santander precisa ser conferido contra a
 * documentação técnica assinada - o formato abaixo segue o esqueleto
 * genérico da API de Cobrança v2 e está isolado aqui de propósito, pra ser
 * o único lugar a ajustar quando a doc chegar.
 */
async function registrarBoleto({ workspaceId, nossoNumero, valor, vencimento, pagador, percentualMulta, percentualJurosAoMes }) {
  const token = await getToken();
  const client = getClient();

  const payload = {
    nsuCode: nossoNumero,
    environment: process.env.SANTANDER_ENVIRONMENT || "TEST",
    nsuDate: new Date().toISOString(),
    covenantCode: workspaceId,
    bankNumber: nossoNumero,
    dueDate: vencimento, // AAAA-MM-DD
    nominalValue: Number(valor).toFixed(2),
    fineSettings: percentualMulta
      ? { type: "PERCENTUAL", value: Number(percentualMulta).toFixed(2) }
      : undefined,
    interestSettings: percentualJurosAoMes
      ? { type: "MONTHLY_PERCENTUAL", value: Number(percentualJurosAoMes).toFixed(2) }
      : undefined,
    payer: {
      name: pagador.nome,
      documentType: pagador.cpf.length > 11 ? "CNPJ" : "CPF",
      documentNumber: pagador.cpf,
      address: pagador.endereco,
      neighborhood: pagador.bairro,
      city: pagador.cidade,
      state: pagador.uf,
      zipCode: pagador.cep,
    },
    documentKind: "DUPLICATA_MERCANTIL",
    key: { type: "NSU_CODE", dictKey: nossoNumero },
  };

  const { data } = await client.post(
    `/collection_bill_management/v2/workspaces/${workspaceId}/bank_slips`,
    payload,
    { headers: headersAutenticados(token) }
  );

  return data;
}

async function consultarBoleto({ workspaceId, nossoNumero }) {
  const token = await getToken();
  const client = getClient();

  const { data } = await client.get(
    `/collection_bill_management/v2/workspaces/${workspaceId}/bank_slips/${nossoNumero}`,
    { headers: headersAutenticados(token) }
  );

  return data;
}

/**
 * Baixa/cancela um boleto já registrado (ex: lançamento errado, unidade quitou por fora).
 */
async function cancelarBoleto({ workspaceId, nossoNumero }) {
  const token = await getToken();
  const client = getClient();

  const { data } = await client.patch(
    `/collection_bill_management/v2/workspaces/${workspaceId}/bank_slips/${nossoNumero}/instructions`,
    { covenantCode: workspaceId, bankNumber: nossoNumero, operation: "BAIXA" },
    { headers: headersAutenticados(token) }
  );

  return data;
}

module.exports = {
  getToken,
  registrarBoleto,
  consultarBoleto,
  cancelarBoleto,
};
