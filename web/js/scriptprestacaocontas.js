/* =========================
   PRESTAÇÃO DE CONTAS (ADM) - PADRÃO PAIVA (igual Comunicados)
   - Cards + Abas por condomínio + Todos
   - Busca (filtro decente)
   - Sem edição (removido)
   - Toast
   - Cloudinary mantido
========================= */

// =========================
// ELEMENTOS
// =========================
const caixaForms = document.querySelector("#caixaForms");
const selectCondominio = document.querySelector("#condominioSelect");
const filePrestacaoHint = document.querySelector("#filePrestacaoHint");

const tabs = document.querySelector("#tabsCondominios");
const tabsContent = document.querySelector("#tabsCondominiosContent");

const filtroPrestacao = document.querySelector("#filtroPrestacao");
const qtdPrestacoes = document.querySelector("#qtdPrestacoes");
const emptyStatePrestacao = document.querySelector("#emptyStatePrestacao");

// Toast
const toastEl = document.querySelector("#toastPrest");
const toastTitle = document.querySelector("#toastTitlePrest");
const toastMsg = document.querySelector("#toastMsgPrest");
const toastIcon = document.querySelector("#toastIconPrest");
const toastClose = document.querySelector("#toastClosePrest");

// =========================
// URLS
// =========================
const uri = "https://integrada-api.onrender.com/prestacaocontascontroller";
const uriCondominio = "https://integrada-api.onrender.com/condominiocontroller";

// aba ativa
const LS_TAB_KEY = "prestacao_tab_ativa";

// cache
let prestacoesCache = [];
let condominiosCache = [];

// =========================
// TOAST
// =========================
let toastTimer = null;

function showToast(type, title, msg) {
  if (!toastEl) return;

  toastEl.classList.remove("show", "success", "error", "info");
  toastEl.classList.add("show", type);

  if (toastTitle) toastTitle.textContent = title || "Aviso";
  if (toastMsg) toastMsg.textContent = msg || "";

  if (toastIcon) {
    toastIcon.innerHTML =
      type === "success" ? `<i class="fas fa-check"></i>` :
        type === "error" ? `<i class="fas fa-times"></i>` :
          `<i class="fas fa-info"></i>`;
  }

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove("show"), 3500);
}
toastClose?.addEventListener("click", () => toastEl.classList.remove("show"));

// =========================
// HINTS FILE
// =========================
document.querySelector("#documento")?.addEventListener("change", (e) => {
  const f = e.target.files?.[0];
  if (filePrestacaoHint) {
    filePrestacaoHint.textContent = f ? `Selecionado: ${f.name}` : "Nenhum arquivo selecionado.";
  }
});

// =========================
// HELPERS
// =========================
function slugId(str) {
  return String(str || "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "")
    .toLowerCase();
}

function parseISODateLocal(iso) {
  if (!iso) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
    const [y, m, d] = iso.split("-").map(Number);
    return new Date(y, m - 1, d);
  }
  const dt = new Date(iso);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

function formatMesLabel(iso) {
  const dt = parseISODateLocal(iso);
  if (!dt) return "—";
  return dt.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
}

// vários formatos pra busca ficar BOA
function buildMesSearchTokens(iso) {
  const dt = parseISODateLocal(iso);
  if (!dt) return [];
  const y = dt.getFullYear();
  const m = pad2(dt.getMonth() + 1);
  const nome = dt.toLocaleDateString("pt-BR", { month: "long" });

  return [
    `${y}-${m}`,
    `${m}/${y}`,
    `${m}-${y}`,
    `${nome} ${y}`,
    `${y}`,
    `${nome}`,
  ];
}

function setActiveTab(paneId) {
  const btn = tabs?.querySelector(`[data-target="#${paneId}"]`);
  if (!btn) return;

  if (window.$ && typeof window.$ === "function") {
    window.$(btn).tab("show");
  } else {
    btn.click();
  }
}

async function onClickAbrirDocumento(documentoUrl) {
  try {
    const response = await fetch(documentoUrl);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  } catch {
    showToast("error", "Erro", "Não foi possível abrir o PDF.");
  }
}

// =========================
// CLOUDINARY UPLOAD (mantido)
// =========================
const cloudinaryUpload = async (file) => {
  const CLOUDINARY_API_KEY = "839478495457115";
  const CLOUDINARY_API_SECRET = "H00NjZ74G8NAOGL-MxhCAaVge9g";

  try {
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", "integrada");
    data.append("cloud_name", "dfdinbti3");
    data.append("folder", "integrada");
    data.append("api_key", CLOUDINARY_API_KEY);
    data.append("api_secret", CLOUDINARY_API_SECRET);

    const res = await fetch("https://api.cloudinary.com/v1_1/integrada/image/upload", {
      method: "POST",
      body: data,
    }).then((r) => r.json());

    if (res.error) throw new Error(res.error.message);

    return { data: res.secure_url, error: null };
  } catch (error) {
    console.log(error);
    return { data: null, error: "erro ao fazer upload" };
  }
};

// =========================
// CARREGAR CONDOMÍNIOS
// =========================
async function carregarCondominios() {
  try {
    const res = await fetch(uriCondominio);
    const dados = await res.json();
    condominiosCache = Array.isArray(dados) ? dados : [];

    if (!selectCondominio) return;

    selectCondominio.innerHTML = `<option value="">Selecione o condomínio</option>`;

    condominiosCache.forEach((c) => {
      const opt = document.createElement("option");
      opt.value = c.condominioid;
      opt.textContent = c.nomecondominio;
      selectCondominio.appendChild(opt);
    });
  } catch (e) {
    console.error(e);
    showToast("error", "Erro", "Falha ao carregar lista de condomínios.");
  }
}

// =========================
// RENDER: ABAS + CARDS
// =========================
function renderAbasEConteudo(lista) {
  if (!tabs || !tabsContent) return;

  tabs.innerHTML = "";
  tabsContent.innerHTML = "";

  if (qtdPrestacoes) qtdPrestacoes.textContent = String(lista.length);

  if (!lista.length) {
    emptyStatePrestacao?.classList.remove("d-none");
    return;
  }
  emptyStatePrestacao?.classList.add("d-none");

  const abaSalva = localStorage.getItem(LS_TAB_KEY) || "pane-todos";

  // agrupar por condomínio
  const grupos = new Map();
  lista.forEach((p) => {
    const nome = p.nomeCondominio || "Sem condomínio";
    const key = `${p.CondominioID}|||${nome}`;
    if (!grupos.has(key)) grupos.set(key, []);
    grupos.get(key).push(p);
  });

  const gruposOrdenados = Array.from(grupos.entries()).sort((a, b) => {
    const nomeA = a[0].split("|||")[1].toLowerCase();
    const nomeB = b[0].split("|||")[1].toLowerCase();
    return nomeA.localeCompare(nomeB);
  });

  // ===== ABA TODOS =====
  const tabIdAll = "tab-todos";
  const paneIdAll = "pane-todos";
  const isActiveAll = abaSalva === paneIdAll || !abaSalva;

  tabs.innerHTML += `
    <button class="paiva-chip ${isActiveAll ? "active" : ""}" id="${tabIdAll}"
      data-toggle="tab" data-target="#${paneIdAll}"
      type="button" role="tab" aria-controls="${paneIdAll}" aria-selected="${isActiveAll ? "true" : "false"}">
      Todos <span class="paiva-chip__badge" data-badge="${paneIdAll}">${lista.length}</span>
    </button>
  `;

  tabsContent.innerHTML += `
    <div class="tab-pane fade ${isActiveAll ? "show active" : ""}" id="${paneIdAll}" role="tabpanel" aria-labelledby="${tabIdAll}">
      <div class="row" id="cards-todos"></div>
    </div>
  `;

  renderCardsNoContainer(document.querySelector("#cards-todos"), lista);

  // ===== ABAS POR CONDOMÍNIO =====
  gruposOrdenados.forEach(([key, items]) => {
    const [condominioId, nomeCondominio] = key.split("|||");
    const safeId = slugId(condominioId);

    const tabId = `tab-${safeId}`;
    const paneId = `pane-${safeId}`;
    const isActive = abaSalva === paneId;

    tabs.innerHTML += `
      <button class="paiva-chip ${isActive ? "active" : ""}" id="${tabId}"
        data-toggle="tab" data-target="#${paneId}"
        type="button" role="tab" aria-controls="${paneId}" aria-selected="${isActive ? "true" : "false"}">
        ${nomeCondominio}
        <span class="paiva-chip__badge" data-badge="${paneId}">${items.length}</span>
      </button>
    `;

    tabsContent.innerHTML += `
      <div class="tab-pane fade ${isActive ? "show active" : ""}" id="${paneId}" role="tabpanel" aria-labelledby="${tabId}">
        <div class="row" id="cards-${safeId}"></div>
      </div>
    `;

    renderCardsNoContainer(document.querySelector(`#cards-${safeId}`), items);
  });

  // mantém active premium (bootstrap nem sempre reflete no nosso botão)
  tabs.querySelectorAll(".paiva-chip").forEach((b) => {
    b.addEventListener("click", () => {
      tabs.querySelectorAll(".paiva-chip").forEach((x) => x.classList.remove("active"));
      b.classList.add("active");
    });
  });

  // se a aba salva não existir no filtro atual, volta pro Todos
  const paneFinal = document.querySelector(`#${abaSalva}`) ? abaSalva : "pane-todos";
  localStorage.setItem(LS_TAB_KEY, paneFinal);
  setActiveTab(paneFinal);
}

function renderCardsNoContainer(container, lista) {
  if (!container) return;
  container.innerHTML = "";

  if (!lista.length) {
    container.innerHTML = `
      <div class="col-12">
        <div class="text-muted py-3">Nenhum registro encontrado nesta aba.</div>
      </div>
    `;
    return;
  }

  lista.forEach((p) => {
    const id = p.prestacaoid ?? p.id;
    const nomeCondominio = p.nomeCondominio || "—";
    const mesLabel = formatMesLabel(p.mes);
    const documentoUrl = p.documentoUrl || null;

    const col = document.createElement("div");
    col.className = "col-md-6 col-lg-4 mb-4";

    const btnAbrir = documentoUrl
      ? `<button class="btn btn-sm btn-primary paiva-btn-primary" data-abrir="${id}">
           <i class="fas fa-file-pdf mr-1"></i> Abrir
         </button>`
      : `<button class="btn btn-sm btn-secondary" disabled>
           <i class="fas fa-file-pdf mr-1"></i> Abrir
         </button>`;

    col.innerHTML = `
      <div class="card shadow-sm h-100 paiva-card-list">
        <div class="card-body">
          <div class="d-flex align-items-start justify-content-between">
            <div>
              <div class="paiva-card-kicker" style="text-transform: capitalize;">${mesLabel}</div>
              <h5 class="paiva-card-title">Prestação de contas</h5>
              <div class="paiva-card-sub">
                <i class="fas fa-building mr-1"></i> ${nomeCondominio}
              </div>
            </div>
            <div class="paiva-badge-ok">OK</div>
          </div>

          <div class="mt-2">
            <strong>PDF:</strong>
            <span class="text-muted">${documentoUrl ? "Anexado" : "Sem anexo"}</span>
          </div>

          <div class="d-flex align-items-center mt-3" style="gap:10px;">
            ${btnAbrir}

            <button class="btn btn-sm btn-danger" data-excluir="${id}">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    `;

    container.appendChild(col);

    col.querySelector(`[data-abrir="${id}"]`)?.addEventListener("click", () => {
      if (documentoUrl) onClickAbrirDocumento(documentoUrl);
    });

    col.querySelector(`[data-excluir="${id}"]`)?.addEventListener("click", () => {
      onClickExcluirDocumento(id);
    });
  });
}

// =========================
// LISTAR
// =========================
async function listarPrestacoes() {
  try {
    const res = await fetch(uri);
    const dados = await res.json();
    prestacoesCache = Array.isArray(dados) ? dados : [];
    aplicarFiltro();
  } catch (e) {
    console.error(e);
    showToast("error", "Erro", "Falha ao carregar prestações.");
  }
}

// =========================
// FILTRO (BOM)
// =========================
function aplicarFiltro() {
  const q = (filtroPrestacao?.value || "").trim().toLowerCase();

  if (!q) {
    renderAbasEConteudo(prestacoesCache);
    return;
  }

  const filtrado = prestacoesCache.filter((p) => {
    const id = String(p.prestacaoid ?? p.id ?? "");
    const nome = String(p.nomeCondominio || "").toLowerCase();

    const tokensMes = buildMesSearchTokens(p.mes).map((t) => String(t).toLowerCase());
    const mesLabel = formatMesLabel(p.mes).toLowerCase();

    const base = [
      id.toLowerCase(),
      nome,
      mesLabel,
      ...tokensMes,
      String(p.mes || "").toLowerCase(),
      String(p.CondominioID || "").toLowerCase(),
    ].join(" | ");

    return base.includes(q);
  });

  renderAbasEConteudo(filtrado);

  // se a aba ativa ficou vazia, volta pra Todos
  const paneAtiva = localStorage.getItem(LS_TAB_KEY) || "pane-todos";
  const paneEl = document.querySelector(`#${paneAtiva}`);
  const cardsDentro = paneEl?.querySelectorAll?.(".paiva-card-list")?.length || 0;

  if (paneAtiva !== "pane-todos" && cardsDentro === 0) {
    localStorage.setItem(LS_TAB_KEY, "pane-todos");
    setActiveTab("pane-todos");

    tabs?.querySelectorAll(".paiva-chip")?.forEach((x) => x.classList.remove("active"));
    tabs?.querySelector(`[data-target="#pane-todos"]`)?.classList.add("active");
  }
}

filtroPrestacao?.addEventListener("input", aplicarFiltro);

// =========================
// SALVAR ABA ATIVA
// =========================
function bindSalvarAbaAtiva() {
  if (!tabs) return;

  tabs.addEventListener("shown.bs.tab", (ev) => {
    const target = ev.target?.getAttribute?.("data-target");
    if (target) localStorage.setItem(LS_TAB_KEY, target.replace("#", ""));
  });

  tabs.addEventListener("click", (ev) => {
    const btn = ev.target?.closest?.("[data-toggle='tab']");
    if (!btn) return;
    const target = btn.getAttribute("data-target");
    if (target) localStorage.setItem(LS_TAB_KEY, target.replace("#", ""));
  });
}

// =========================
// CREATE
// =========================
caixaForms?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const file = caixaForms.documento?.files?.[0];
  if (!file) {
    showToast("error", "Erro", "Selecione um PDF.");
    return;
  }

  if (!selectCondominio?.value) {
    showToast("error", "Erro", "Selecione um condomínio.");
    return;
  }

  const uploadResult = await cloudinaryUpload(file);
  if (uploadResult.error) {
    showToast("error", "Erro", "Erro ao fazer upload do PDF!");
    return;
  }

  try {
    const res = await fetch(uri, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        documentoUrl: uploadResult.data,
        mes: caixaForms.mes.value,
        CondominioID: selectCondominio.value,
      }),
    });

    if (res.status === 201 || res.ok) {
      caixaForms.reset();
      if (filePrestacaoHint) filePrestacaoHint.textContent = "Nenhum arquivo selecionado.";
      showToast("success", "Sucesso", "Prestação cadastrada com sucesso!");
      await listarPrestacoes();
    } else {
      showToast("error", "Erro", "Erro ao cadastrar prestação.");
    }
  } catch (err) {
    console.error(err);
    showToast("error", "Erro", "Falha ao cadastrar prestação.");
  }
});

// =========================
// DELETE
// =========================
async function onClickExcluirDocumento(id) {
  const confirmar = confirm("Tem certeza que deseja excluir esta prestação?");
  if (!confirmar) return;

  try {
    const res = await fetch(`${uri}/${id}`, { method: "DELETE" });

    if (res.status === 200 || res.ok) {
      showToast("success", "Excluído", "Prestação excluída com sucesso!");
      await listarPrestacoes();
    } else {
      showToast("error", "Erro", "Não foi possível excluir.");
    }
  } catch (e) {
    console.error(e);
    showToast("error", "Erro", "Falha ao excluir.");
  }
}

// =========================
// INIT
// =========================
document.addEventListener("DOMContentLoaded", async () => {
  bindSalvarAbaAtiva();
  await carregarCondominios();
  await listarPrestacoes();
});
