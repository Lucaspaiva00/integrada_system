// Reutiliza as mesmas consultas para os indicadores e a tabela do dashboard.
const baseURL = "https://integrada-api.onrender.com";
const consultas = new Map();

function buscarRegistros(endpoint) {
  if (!consultas.has(endpoint)) {
    consultas.set(endpoint, (async () => {
      const response = await fetch(`${baseURL}/${endpoint}`, {
        cache: "no-store",
        signal: AbortSignal.timeout(30000),
      });
      if (!response.ok) throw new Error(`Falha ao consultar ${endpoint}`);
      const data = await response.json();
      if (!Array.isArray(data)) throw new Error("Resposta de cadastro inválida");
      return data;
    })());
  }
  return consultas.get(endpoint);
}

async function contarRegistros(endpoint, elementoID) {
  const alvo = document.getElementById(elementoID);
  if (!alvo) return;
  try {
    const data = await buscarRegistros(endpoint);
    alvo.textContent = data.length.toLocaleString("pt-BR");
    alvo.title = "Total de registros cadastrados, não de acessos ao portal";
  } catch {
    alvo.textContent = "—";
    alvo.title = "Não foi possível consultar este cadastro. Atualize a página para tentar novamente.";
  }
}

function mensagemTabela(tbody, message, erro = false) {
  const row = document.createElement("tr");
  const cell = document.createElement("td");
  cell.colSpan = 4;
  cell.className = `text-center py-4 ${erro ? "text-danger" : "text-muted"}`;
  cell.textContent = message;
  row.append(cell);
  tbody.replaceChildren(row);
}

async function carregarTabelaCondominios() {
  const tbody = document.getElementById("tbodyCondominiosDashboard");
  if (!tbody) return;
  mensagemTabela(tbody, "Carregando condomínios...");
  const [condominiosResult, proprietariosResult] = await Promise.allSettled([
    buscarRegistros("condominiocontroller"),
    buscarRegistros("clientescontroller"),
  ]);
  if (condominiosResult.status === "rejected") {
    mensagemTabela(tbody, "Erro ao carregar dados dos condomínios. Atualize a página para tentar novamente.", true);
    return;
  }
  const condominios = condominiosResult.value;
  if (!condominios.length) {
    mensagemTabela(tbody, "Nenhum condomínio cadastrado ainda.");
    return;
  }
  const totais = new Map();
  if (proprietariosResult.status === "fulfilled") {
    for (const owner of proprietariosResult.value) {
      const id = Number(owner.CondominioID);
      totais.set(id, (totais.get(id) || 0) + 1);
    }
  }
  const rows = condominios.map(cond => {
    const row = document.createElement("tr");
    const nome = document.createElement("td");
    nome.className = "font-weight-bold";
    const link = document.createElement("a");
    link.className = "paiva-link";
    link.href = `detalhes-condominio.html?id=${encodeURIComponent(cond.condominioid)}`;
    link.textContent = cond.nomecondominio || "—";
    nome.append(link);
    row.append(nome);
    for (const text of [cond.endereco || "SEM ENDEREÇO", cond.telefone || "SEM TELEFONE"]) {
      const cell = document.createElement("td");
      cell.textContent = text;
      row.append(cell);
    }
    const total = document.createElement("td");
    total.className = "text-center font-weight-bold";
    total.textContent = proprietariosResult.status === "fulfilled"
      ? (totais.get(Number(cond.condominioid)) || 0).toLocaleString("pt-BR") : "—";
    if (proprietariosResult.status === "rejected") total.title = "Contagem indisponível";
    row.append(total);
    return row;
  });
  tbody.replaceChildren(...rows);
}

function iniciarDashboard() {
  contarRegistros("condominiocontroller", "qtdCondominios");
  contarRegistros("clientescontroller", "qtdProprietarios");
  contarRegistros("inquilinoscontroller", "qtdInquilinos");
  contarRegistros("comunicadoscontroller", "qtdComunicados");
  contarRegistros("assembleiascontroller", "qtdAssembleias");
  carregarTabelaCondominios();
}
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", iniciarDashboard);
} else {
  iniciarDashboard();
}
