// =========================
// scriptboletos.js - página dedicada de consulta de boletos
// =========================

const baseURL = "https://integrada-api.onrender.com";

const selectCondominio = document.querySelector("#selectCondominio");
const selectFiltroUnidade = document.querySelector("#selectFiltroUnidade");
const btnAtualizarBoletos = document.querySelector("#btnAtualizarBoletos");
const tbodyBoletos = document.querySelector("#tbodyBoletos");
const painelHistorico = document.querySelector("#painelHistorico");

// =========================
// TOAST (mesmo padrão das outras páginas do admin)
// =========================
const toast = document.getElementById("toast");
const toastTitle = document.getElementById("toastTitle");
const toastMsg = document.getElementById("toastMsg");
const toastIcon = document.getElementById("toastIcon");
const toastClose = document.getElementById("toastClose");
let toastTimer = null;

function showToast({ type = "success", title = "Tudo certo", message = "" }) {
  toast.classList.remove("is-success", "is-error", "is-info", "is-warn");
  const map = {
    success: { cls: "is-success", icon: "fa-check" },
    error: { cls: "is-error", icon: "fa-times" },
    info: { cls: "is-info", icon: "fa-info" },
    warn: { cls: "is-warn", icon: "fa-exclamation" },
  };
  const cfg = map[type] || map.success;
  toast.classList.add(cfg.cls);
  toastTitle.textContent = title;
  toastMsg.textContent = message;
  toastIcon.innerHTML = `<i class="fas ${cfg.icon}"></i>`;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 3200);
}
toastClose?.addEventListener("click", () => {
  toast.classList.remove("show");
  clearTimeout(toastTimer);
});

function escapeHtml(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatarMoeda(valor) {
  const numero = Number(valor);
  if (Number.isNaN(numero)) return "—";
  return numero.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatarData(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR");
}

const STATUS_BADGE = {
  PENDENTE: "badge-warning",
  REGISTRADO: "badge-info",
  PAGO: "badge-success",
  VENCIDO: "badge-danger",
  CANCELADO: "badge-secondary",
  ERRO: "badge-danger",
};

const STATUS_LABEL = {
  PENDENTE: "Pendente (aguardando o banco)",
  REGISTRADO: "Registrado no Santander",
  PAGO: "Pago",
  VENCIDO: "Vencido",
  CANCELADO: "Cancelado",
  ERRO: "Erro ao registrar",
};

const ORIGEM_LABEL = {
  geracao: "Geração do boleto",
  webhook_santander: "Confirmação do Santander",
  sincronizacao_manual: "Sincronização manual",
  admin: "Ação do administrador",
};

function condominioSelecionado() {
  return selectCondominio.value ? Number(selectCondominio.value) : null;
}

// =========================
// Carregar condomínios
// =========================
async function carregarCondominios() {
  try {
    const res = await fetch(`${baseURL}/condominiocontroller`);
    const dados = await res.json();

    selectCondominio.innerHTML = `<option value="">Selecione...</option>`;
    (Array.isArray(dados) ? dados : []).forEach((c) => {
      const opt = document.createElement("option");
      opt.value = c.condominioid;
      opt.textContent = c.nomecondominio;
      selectCondominio.appendChild(opt);
    });
  } catch (err) {
    console.error(err);
    selectCondominio.innerHTML = `<option value="">Erro ao carregar condomínios</option>`;
    showToast({ type: "error", title: "Falha de conexão", message: "Não consegui carregar os condomínios." });
  }
}

selectCondominio.addEventListener("change", () => {
  const id = condominioSelecionado();
  painelHistorico.innerHTML = "";
  if (!id) {
    tbodyBoletos.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4">Selecione um condomínio acima.</td></tr>`;
    selectFiltroUnidade.innerHTML = `<option value="">Todas as unidades do condomínio</option>`;
    return;
  }
  carregarUnidades(id);
  carregarBoletos(id);
});

// =========================
// Unidades do condomínio (só pro filtro)
// =========================
async function carregarUnidades(condominioId) {
  try {
    const res = await fetch(`${baseURL}/clientescontroller`);
    const clientes = await res.json();

    const doCondominio = (Array.isArray(clientes) ? clientes : []).filter(
      (c) => Number(c.CondominioID) === Number(condominioId)
    );

    selectFiltroUnidade.innerHTML = `<option value="">Todas as unidades do condomínio</option>`;
    doCondominio.forEach((c) => {
      const opt = document.createElement("option");
      opt.value = c.clienteid;
      opt.textContent = `Apto ${c.apartamento} - ${c.nome}`;
      selectFiltroUnidade.appendChild(opt);
    });
  } catch (err) {
    console.error(err);
  }
}

selectFiltroUnidade.addEventListener("change", () => {
  const id = condominioSelecionado();
  if (!id) return;
  carregarBoletos(id);
});

// =========================
// Listagem de boletos
// =========================
async function carregarBoletos(condominioId) {
  try {
    tbodyBoletos.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4">Carregando boletos...</td></tr>`;
    const clienteFiltro = selectFiltroUnidade.value;
    const url = clienteFiltro
      ? `${baseURL}/boletoscontroller?condominioid=${condominioId}&clienteid=${clienteFiltro}`
      : `${baseURL}/boletoscontroller?condominioid=${condominioId}`;
    const res = await fetch(url);
    const boletos = await res.json();
    renderBoletos(Array.isArray(boletos) ? boletos : []);
  } catch (err) {
    console.error(err);
    tbodyBoletos.innerHTML = `<tr><td colspan="6" class="text-center text-danger py-4">Erro ao carregar boletos.</td></tr>`;
  }
}

function renderBoletos(boletos) {
  if (!boletos.length) {
    tbodyBoletos.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4">Nenhum boleto gerado ainda para este condomínio.</td></tr>`;
    return;
  }

  tbodyBoletos.innerHTML = "";
  boletos.forEach((b) => {
    const badgeClass = STATUS_BADGE[b.status] || "badge-light";
    const competencia = new Date(b.competencia).toLocaleDateString("pt-BR", { month: "2-digit", year: "numeric" });

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${escapeHtml(b.Cliente?.apartamento)} - ${escapeHtml(b.Cliente?.nome)}</td>
      <td>${competencia}</td>
      <td>${formatarData(b.vencimento)}</td>
      <td>${formatarMoeda(b.valorTotal)}</td>
      <td><span class="badge ${badgeClass}">${escapeHtml(b.status)}</span></td>
      <td>
        <div class="paiva-actions">
          ${b.nossoNumero ? `<button class="btn btn-sm btn-light paiva-btn-light" data-action="sincronizar" data-id="${b.boletoid}" title="Sincronizar com o Santander"><i class="fas fa-sync"></i></button>` : ""}
          <button class="btn btn-sm btn-light paiva-btn-light" data-action="historico" data-id="${b.boletoid}" title="Ver histórico"><i class="fas fa-history"></i></button>
          ${b.status !== "PAGO" && b.status !== "CANCELADO" ? `<button class="btn btn-sm btn-outline-danger" data-action="cancelar" data-id="${b.boletoid}" title="Cancelar boleto"><i class="fas fa-ban"></i></button>` : ""}
        </div>
      </td>
    `;
    tbodyBoletos.appendChild(tr);
  });
}

tbodyBoletos.addEventListener("click", async (e) => {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;

  const action = btn.getAttribute("data-action");
  const id = btn.getAttribute("data-id");
  const condominioId = condominioSelecionado();

  try {
    if (action === "historico") {
      painelHistorico.innerHTML = `<div class="text-muted">Carregando histórico...</div>`;
      painelHistorico.scrollIntoView({ behavior: "smooth", block: "nearest" });

      const res = await fetch(`${baseURL}/boletoscontroller/${id}`);
      const boleto = await res.json();

      const linhas = (boleto.Historico || []).map((h) => {
        const quando = new Date(h.criadoEm).toLocaleString("pt-BR");
        const origem = ORIGEM_LABEL[h.origem] || h.origem;
        const de = h.statusAnterior ? (STATUS_LABEL[h.statusAnterior] || h.statusAnterior) : "—";
        const para = STATUS_LABEL[h.statusNovo] || h.statusNovo;
        return `<li><strong>${quando}</strong> — ${de} → <strong>${para}</strong> <span class="text-muted">(${origem})</span></li>`;
      }).join("");

      painelHistorico.innerHTML = `
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <strong>Histórico - Apto ${escapeHtml(boleto.Cliente?.apartamento)} - ${escapeHtml(boleto.Cliente?.nome)}</strong>
            <button class="btn btn-sm btn-light" id="btnFecharHistorico"><i class="fas fa-times"></i></button>
          </div>
          <div class="card-body">
            <ul class="pl-3 mb-0">${linhas || "<li>Nenhum evento registrado ainda.</li>"}</ul>
          </div>
        </div>
      `;

      document.querySelector("#btnFecharHistorico")?.addEventListener("click", () => {
        painelHistorico.innerHTML = "";
      });
      return;
    }

    if (action === "sincronizar") {
      const res = await fetch(`${baseURL}/boletoscontroller/${id}/sincronizar`);
      if (res.ok) {
        showToast({ type: "info", title: "Sincronizado", message: "Situação do boleto atualizada com o Santander." });
      } else {
        showToast({ type: "error", title: "Erro", message: "Não consegui sincronizar com o Santander agora." });
      }
    }

    if (action === "cancelar") {
      if (!confirm("Tem certeza que quer cancelar este boleto? Essa ação avisa o Santander pra baixar o título.")) return;
      const res = await fetch(`${baseURL}/boletoscontroller/${id}`, { method: "DELETE" });
      if (res.ok) {
        showToast({ type: "success", title: "Boleto cancelado", message: "O boleto foi baixado." });
      } else {
        const erro = await res.json().catch(() => ({}));
        showToast({ type: "error", title: "Erro ao cancelar", message: erro.error || "Não foi possível cancelar." });
      }
    }

    carregarBoletos(condominioId);
  } catch (err) {
    console.error(err);
    showToast({ type: "error", title: "Falha de conexão", message: "Verifique a internet / API e tente novamente." });
  }
});

btnAtualizarBoletos.addEventListener("click", () => {
  const id = condominioSelecionado();
  if (!id) {
    showToast({ type: "warn", title: "Atenção", message: "Selecione um condomínio primeiro." });
    return;
  }
  carregarBoletos(id);
});

// init
carregarCondominios();
