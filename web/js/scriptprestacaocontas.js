/* =========================
   PRESTAÇÃO DE CONTAS (ADM) - PADRÃO PAIVA (igual Comunicados)
   - Cards + Abas por condomínio + Todos
   - Busca
   - Modal de edição (card)
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

// Modal
const modalEdit = document.querySelector("#modalEditPrestacao");
const formEditar = document.querySelector("#formEditarPrestacao");
const selectCondominioEdit = document.querySelector("#CondominioIDEditPrest");
const fileHintEdit = document.querySelector("#fileHintEditPrest");

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
  toastEl.classList.remove("show", "success", "error", "info");
  toastEl.classList.add("show", type);

  toastTitle.textContent = title || "Aviso";
  toastMsg.textContent = msg || "";

  toastIcon.innerHTML =
    type === "success" ? `<i class="fas fa-check"></i>` :
      type === "error" ? `<i class="fas fa-times"></i>` :
        `<i class="fas fa-info"></i>`;

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove("show"), 3500);
}
toastClose?.addEventListener("click", () => toastEl.classList.remove("show"));

// =========================
// MODAL
// =========================
function openModal() {
  modalEdit.classList.remove("d-none");
  modalEdit.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}
function closeModal() {
  modalEdit.classList.add("d-none");
  modalEdit.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}
modalEdit?.addEventListener("click", (e) => {
  const el = e.target;
  if (el?.getAttribute?.("data-close") === "true") closeModal();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !modalEdit.classList.contains("d-none")) closeModal();
});

// =========================
// HINTS FILE
// =========================
document.querySelector("#documento")?.addEventListener("change", (e) => {
  const f = e.target.files?.[0];
  if (filePrestacaoHint) filePrestacaoHint.textContent = f ? `Selecionado: ${f.name}` : "Nenhum arquivo selecionado.";
});
document.querySelector("#documentoEditPrest")?.addEventListener("change", (e) => {
  const f = e.target.files?.[0];
  if (fileHintEdit) fileHintEdit.textContent = f ? `Selecionado: ${f.name}` : "Mantendo o documento atual.";
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

// evita bug de timezone com yyyy-mm-dd
function parseISODateLocal(iso) {
  if (!iso) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
    const [y, m, d] = iso.split("-").map(Number);
    return new Date(y, m - 1, d);
  }
  const dt = new Date(iso);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

function formatMes(iso) {
  const dt = parseISODateLocal(iso);
  if (!dt) return "—";
  return dt.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
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
// CARREGAR CONDOMÍNIOS (2 selects)
// =========================
async function carregarCondominios() {
  try {
    const res = await fetch(uriCondominio);
    const dados = await res.json();
    condominiosCache = Array.isArray(dados) ? dados : [];

    // novo
    selectCondominio.innerHTML = `<option value="">Selecione o condomínio</option>`;
    // edit
    selectCondominioEdit.innerHTML = `<option value="">Selecione o condomínio</option>`;

    condominiosCache.forEach((c) => {
      const opt1 = document.createElement("option");
      opt1.value = c.condominioid;
      opt1.textContent = c.nomecondominio;
      selectCondominio.appendChild(opt1);

      const opt2 = document.createElement("option");
      opt2.value = c.condominioid;
      opt2.textContent = c.nomecondominio;
      selectCondominioEdit.appendChild(opt2);
    });
  } catch (e) {
    console.error(e);
    showToast("error", "Erro", "Falha ao carregar lista de condomínios.");
  }
}

// =========================
// LISTAR + RENDER (ABAS + CARDS)
// =========================
function renderAbasEConteudo(lista) {
  tabs.innerHTML = "";
  tabsContent.innerHTML = "";

  // total
  qtdPrestacoes.textContent = String(lista.length);

  if (!lista.length) {
    emptyStatePrestacao.classList.remove("d-none");
    return;
  }
  emptyStatePrestacao.classList.add("d-none");

  // aba salva
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
    <li class="nav-item" role="presentation">
      <button class="nav-link ${isActiveAll ? "active" : ""}" id="${tabIdAll}"
        data-toggle="tab" data-target="#${paneIdAll}"
        type="button" role="tab" aria-controls="${paneIdAll}" aria-selected="${isActiveAll ? "true" : "false"}">
        Todos <span class="badge badge-light ml-2">${lista.length}</span>
      </button>
    </li>
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
      <li class="nav-item" role="presentation">
        <button class="nav-link ${isActive ? "active" : ""}" id="${tabId}"
          data-toggle="tab" data-target="#${paneId}"
          type="button" role="tab" aria-controls="${paneId}" aria-selected="${isActive ? "true" : "false"}">
          ${nomeCondominio} <span class="badge badge-light ml-2">${items.length}</span>
        </button>
      </li>
    `;

    tabsContent.innerHTML += `
      <div class="tab-pane fade ${isActive ? "show active" : ""}" id="${paneId}" role="tabpanel" aria-labelledby="${tabId}">
        <div class="row" id="cards-${safeId}"></div>
      </div>
    `;

    renderCardsNoContainer(document.querySelector(`#cards-${safeId}`), items);
  });
}

function renderCardsNoContainer(container, lista) {
  if (!container) return;
  container.innerHTML = "";

  lista.forEach((p) => {
    const id = p.prestacaoid ?? p.id;
    const nomeCondominio = p.nomeCondominio || "—";
    const mes = formatMes(p.mes);
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
              <div class="paiva-card-kicker" style="text-transform: capitalize;">${mes}</div>
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

            <button class="btn btn-sm btn-warning" data-editar="${id}">
              <i class="fas fa-pen mr-1"></i> Editar
            </button>

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

    col.querySelector(`[data-editar="${id}"]`)?.addEventListener("click", () => {
      abrirEdicaoPorCache(id); // não depende do backend ter GET /:id
    });

    col.querySelector(`[data-excluir="${id}"]`)?.addEventListener("click", () => {
      onClickExcluirDocumento(id);
    });
  });
}

async function listarPrestacoes() {
  try {
    const res = await fetch(uri);
    const dados = await res.json();
    prestacoesCache = Array.isArray(dados) ? dados : [];
    aplicarFiltro(); // render com filtro
  } catch (e) {
    console.error(e);
    showToast("error", "Erro", "Falha ao carregar prestações.");
  }
}

// =========================
// FILTRO (busca) - igual comunicados
// =========================
function aplicarFiltro() {
  const q = (filtroPrestacao.value || "").trim().toLowerCase();

  if (!q) {
    renderAbasEConteudo(prestacoesCache);
    return;
  }

  const filtrado = prestacoesCache.filter((p) => {
    const nome = (p.nomeCondominio || "").toLowerCase();
    const mes = (formatMes(p.mes) || "").toLowerCase();
    return nome.includes(q) || mes.includes(q);
  });

  renderAbasEConteudo(filtrado);
}

// salvar aba ativa (bootstrap)
function bindSalvarAbaAtiva() {
  if (!tabs) return;

  tabs.addEventListener("shown.bs.tab", (ev) => {
    const target = ev.target?.getAttribute?.("data-target");
    if (target) localStorage.setItem(LS_TAB_KEY, target.replace("#", ""));
  });

  // fallback (caso o evento não dispare)
  tabs.addEventListener("click", (ev) => {
    const btn = ev.target?.closest?.("[data-toggle='tab']");
    if (!btn) return;
    const target = btn.getAttribute("data-target");
    if (target) localStorage.setItem(LS_TAB_KEY, target.replace("#", ""));
  });
}

filtroPrestacao?.addEventListener("input", aplicarFiltro);

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
// EDIT (abre modal usando cache)
// =========================
function abrirEdicaoPorCache(id) {
  const item = prestacoesCache.find((p) => String(p.prestacaoid ?? p.id) === String(id));
  if (!item) {
    showToast("error", "Erro", "Prestação não encontrada no cache.");
    return;
  }
  abrirEdicao(item);
}

function abrirEdicao(item) {
  const id = item.prestacaoid ?? item.id;

  formEditar.id.value = id;
  formEditar.documentoUrlAtual.value = item.documentoUrl || "";

  // mês
  formEditar.mes.value = (item.mes || "").slice(0, 10);

  // condomínio
  const condId = item.CondominioID || "";
  selectCondominioEdit.value = condId ? String(condId) : "";

  fileHintEdit.textContent = "Mantendo o documento atual.";
  openModal();
}

// =========================
// UPDATE (PUT)
// =========================
formEditar?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = formEditar.id.value;
  const file = formEditar.documento?.files?.[0];

  let documentoUrlFinal = formEditar.documentoUrlAtual.value || "";

  if (file) {
    const up = await cloudinaryUpload(file);
    if (up.error) {
      showToast("error", "Erro", "Erro ao fazer upload do novo PDF!");
      return;
    }
    documentoUrlFinal = up.data;
  }

  try {
    const res = await fetch(`${uri}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        documentoUrl: documentoUrlFinal,
        mes: formEditar.mes.value,
        CondominioID: selectCondominioEdit.value,
      }),
    });

    if (res.status === 200 || res.ok) {
      closeModal();
      showToast("success", "Atualizado", "Prestação atualizada com sucesso!");
      await listarPrestacoes();
    } else {
      showToast("error", "Erro", "Não foi possível salvar a edição (verifique o PUT no backend).");
    }
  } catch (err) {
    console.error(err);
    showToast("error", "Erro", "Falha ao salvar edição.");
  }
});

// =========================
// INIT
// =========================
document.addEventListener("DOMContentLoaded", async () => {
  bindSalvarAbaAtiva();
  await carregarCondominios();
  await listarPrestacoes();
});
