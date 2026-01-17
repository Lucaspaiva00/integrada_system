/* =========================
   PRESTAÇÃO DE CONTAS (ADM)
   - Abas por condomínio
   - Aba "Todos"
   - Filtro de condomínios (mostra/oculta abas)
   - Salva aba ativa (Bootstrap 4 / SB Admin 2)
   - Mantém Cloudinary como estava (API_KEY/SECRET no front)
========================= */

const caixaForms = document.querySelector("#caixaForms");
const selectCondominio = document.querySelector("#condominioSelect");

const tabs = document.querySelector("#tabsCondominios");
const tabsContent = document.querySelector("#tabsCondominiosContent");

const filtroPrestacao = document.querySelector("#filtroPrestacao");

// PROD
const uri = "https://integrada-api.onrender.com/prestacaocontascontroller";
const uriCondominio = "https://integrada-api.onrender.com/condominiocontroller";

// DEV (se quiser trocar manualmente)
const uriDev = "http://localhost:3000/prestacaocontascontroller";

// ✅ chave para guardar aba ativa
const LS_TAB_KEY = "prestacao_tab_ativa";

// cache para filtro
let prestacoesCache = [];
let gruposCache = []; // [{ paneId, tabId, nome, total }]

/* =========================
   Helpers
========================= */
function slugId(str) {
  return String(str || "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "")
    .toLowerCase();
}

// evita bug de timezone em YYYY-MM-DD
function parseISODateLocal(iso) {
  if (!iso) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
    const [y, m, d] = iso.split("-").map(Number);
    return new Date(y, m - 1, d);
  }
  const dt = new Date(iso);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

function formatMes(mesISO) {
  const dt = parseISODateLocal(mesISO);
  if (!dt) return "—";
  return dt.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
}

function setActiveTab(paneId) {
  // paneId sem "#"
  const btn = tabs?.querySelector(`[data-target="#${paneId}"]`);
  if (btn) {
    // bootstrap 4 usa tab('show') via jquery
    if (window.$ && typeof window.$ === "function") {
      window.$(btn).tab("show");
    } else {
      // fallback: simula click
      btn.click();
    }
  }
}

function renderTabelaPorCondominio(tbodyEl, lista, incluiNomeCondominio) {
  tbodyEl.innerHTML = "";

  if (!Array.isArray(lista) || !lista.length) {
    tbodyEl.innerHTML = `
      <tr>
        <td colspan="${incluiNomeCondominio ? 4 : 3}" class="text-center text-muted">
          Nenhuma prestação cadastrada para este condomínio.
        </td>
      </tr>`;
    return;
  }

  lista.forEach((e) => {
    const mesFormatado = formatMes(e.mes);
    const nome = e.nomeCondominio || "—";

    const linkDocumento = e.documentoUrl
      ? `<button type="button" class="btn btn-sm btn-primary" onclick="onClickAbrirDocumento('${e.documentoUrl}')">📄 Abrir PDF</button>`
      : `<span class="text-muted">Sem documento</span>`;

    tbodyEl.innerHTML += `
      <tr>
        ${incluiNomeCondominio ? `<td>${nome}</td>` : ""}
        <td style="text-transform: capitalize;">${mesFormatado}</td>
        <td>${linkDocumento}</td>
        <td style="width: 90px;">
          <button type="button" class="btn btn-sm btn-danger" onclick="onClickExcluirDocumento('${e.prestacaoid}')">🗑️</button>
        </td>
      </tr>
    `;
  });
}

/* =========================
   1) Carregar condomínios no select
========================= */
const carregarCondominios = async () => {
  try {
    const response = await fetch(uriCondominio);
    const condominios = await response.json();

    selectCondominio.innerHTML = `<option value="">Selecione o condomínio</option>`;

    (Array.isArray(condominios) ? condominios : []).forEach((c) => {
      selectCondominio.innerHTML += `
        <option value="${c.condominioid}">
          ${c.nomecondominio}
        </option>`;
    });
  } catch (error) {
    console.error("Erro ao carregar condomínios:", error);
    alert("Erro ao carregar a lista de condomínios.");
  }
};

/* =========================
   ✅ Salvar aba ativa (Bootstrap 4)
   - Evento oficial: shown.bs.tab
   - Fallback: click no botão
========================= */
function bindSalvarAbaAtiva() {
  if (!tabs) return;

  // 1) pelo evento do bootstrap (quando existir)
  tabs.addEventListener("shown.bs.tab", (ev) => {
    const target = ev.target?.getAttribute?.("data-target");
    if (target) localStorage.setItem(LS_TAB_KEY, target.replace("#", ""));
  });

  // 2) fallback por clique
  tabs.addEventListener("click", (ev) => {
    const btn = ev.target?.closest?.("[data-toggle='tab']");
    if (!btn) return;
    const target = btn.getAttribute("data-target");
    if (target) localStorage.setItem(LS_TAB_KEY, target.replace("#", ""));
  });
}

/* =========================
   2) Listar prestações em abas
========================= */
const listarPrestacoes = async () => {
  try {
    const response = await fetch(uri);
    const prestacoes = await response.json();

    prestacoesCache = Array.isArray(prestacoes) ? prestacoes : [];

    // reset
    tabs.innerHTML = "";
    tabsContent.innerHTML = "";
    gruposCache = [];

    if (!prestacoesCache.length) {
      tabs.innerHTML = `
        <li class="nav-item">
          <button class="nav-link active" type="button">Sem registros</button>
        </li>`;
      tabsContent.innerHTML = `
        <div class="alert alert-warning">Nenhuma prestação cadastrada ainda.</div>`;
      return;
    }

    // recupera aba salva (default Todos)
    const abaSalva = localStorage.getItem(LS_TAB_KEY) || "pane-todos";

    // Agrupar por condomínio (ID + Nome)
    const grupos = new Map();
    prestacoesCache.forEach((p) => {
      const key = `${p.CondominioID}|||${p.nomeCondominio || "Sem condomínio"}`;
      if (!grupos.has(key)) grupos.set(key, []);
      grupos.get(key).push(p);
    });

    // Ordenar por nome do condomínio
    const gruposOrdenados = Array.from(grupos.entries()).sort((a, b) => {
      const nomeA = a[0].split("|||")[1].toLowerCase();
      const nomeB = b[0].split("|||")[1].toLowerCase();
      return nomeA.localeCompare(nomeB);
    });

    /* ===== ABA TODOS ===== */
    const tabIdAll = "tab-todos";
    const paneIdAll = "pane-todos";
    const isActiveAll = abaSalva === paneIdAll || !abaSalva;

    tabs.innerHTML += `
      <li class="nav-item" role="presentation">
        <button class="nav-link ${isActiveAll ? "active" : ""}" id="${tabIdAll}"
          data-toggle="tab" data-target="#${paneIdAll}"
          type="button" role="tab" aria-controls="${paneIdAll}"
          aria-selected="${isActiveAll ? "true" : "false"}">
          Todos
          <span class="badge badge-light ml-2">${prestacoesCache.length}</span>
        </button>
      </li>
    `;

    tabsContent.innerHTML += `
      <div class="tab-pane fade ${isActiveAll ? "show active" : ""}" id="${paneIdAll}" role="tabpanel" aria-labelledby="${tabIdAll}">
        <table class="table table-dark table-hover">
          <thead>
            <tr>
              <th>CONDOMÍNIO</th>
              <th>MÊS</th>
              <th>ARQUIVO</th>
              <th style="width: 90px;">AÇÕES</th>
            </tr>
          </thead>
          <tbody id="tbody-todos"></tbody>
        </table>
      </div>
    `;

    const tbodyTodos = document.querySelector("#tbody-todos");
    renderTabelaPorCondominio(tbodyTodos, prestacoesCache, true);

    gruposCache.push({
      paneId: paneIdAll,
      tabId: tabIdAll,
      nome: "Todos",
      total: prestacoesCache.length,
    });

    /* ===== ABAS POR CONDOMÍNIO ===== */
    gruposOrdenados.forEach(([key, lista]) => {
      const [condominioId, nomeCondominio] = key.split("|||");
      const safeId = slugId(condominioId);

      const tabId = `tab-${safeId}`;
      const paneId = `pane-${safeId}`;

      const isActive = abaSalva === paneId;

      tabs.innerHTML += `
        <li class="nav-item" role="presentation">
          <button class="nav-link ${isActive ? "active" : ""}" id="${tabId}"
            data-toggle="tab" data-target="#${paneId}"
            type="button" role="tab" aria-controls="${paneId}"
            aria-selected="${isActive ? "true" : "false"}">
            ${nomeCondominio}
            <span class="badge badge-light ml-2">${lista.length}</span>
          </button>
        </li>
      `;

      tabsContent.innerHTML += `
        <div class="tab-pane fade ${isActive ? "show active" : ""}" id="${paneId}" role="tabpanel" aria-labelledby="${tabId}">
          <table class="table table-dark table-hover">
            <thead>
              <tr>
                <th>MÊS</th>
                <th>ARQUIVO</th>
                <th style="width: 90px;">AÇÕES</th>
              </tr>
            </thead>
            <tbody id="tbody-${safeId}"></tbody>
          </table>
        </div>
      `;

      const tbody = document.querySelector(`#tbody-${safeId}`);
      renderTabelaPorCondominio(tbody, lista, false);

      gruposCache.push({
        paneId,
        tabId,
        nome: nomeCondominio,
        total: lista.length,
      });
    });

    // se a aba salva não existir mais, volta pro Todos
    const existePaneSalva = document.querySelector(`#${abaSalva}`);
    if (!existePaneSalva) {
      localStorage.setItem(LS_TAB_KEY, paneIdAll);
    }

    // aplica filtro atual (se tiver texto)
    aplicarFiltroAbas();

    // força abrir aba salva (garante)
    const paneFinal = localStorage.getItem(LS_TAB_KEY) || paneIdAll;
    setActiveTab(paneFinal);
  } catch (error) {
    console.error("Erro ao carregar prestações:", error);
    tabs.innerHTML = "";
    tabsContent.innerHTML = `<div class="alert alert-danger">Erro ao carregar prestações.</div>`;
  }
};

/* =========================
   ✅ Filtro de abas (por nome do condomínio)
   - Filtra as abas de condomínio (não remove o conteúdo, só oculta)
========================= */
function aplicarFiltroAbas() {
  if (!filtroPrestacao || !tabs) return;

  const q = (filtroPrestacao.value || "").trim().toLowerCase();

  // se vazio, mostra todas
  if (!q) {
    gruposCache.forEach((g) => {
      const tabBtn = document.getElementById(g.tabId);
      if (tabBtn) tabBtn.closest("li")?.classList.remove("d-none");
    });
    return;
  }

  gruposCache.forEach((g) => {
    const tabBtn = document.getElementById(g.tabId);
    if (!tabBtn) return;

    // "Todos" sempre aparece
    if (g.paneId === "pane-todos") {
      tabBtn.closest("li")?.classList.remove("d-none");
      return;
    }

    const match = (g.nome || "").toLowerCase().includes(q);
    tabBtn.closest("li")?.classList.toggle("d-none", !match);
  });

  // se a aba ativa ficou escondida, volta pro Todos
  const activeBtn = tabs.querySelector(".nav-link.active");
  const activeLiHidden = activeBtn?.closest("li")?.classList.contains("d-none");
  if (activeLiHidden) setActiveTab("pane-todos");
}

filtroPrestacao?.addEventListener("input", aplicarFiltroAbas);

/* =========================
   3) Cloudinary Upload (MANTIDO COMO ESTAVA)
========================= */
const cloudinaryUpload = async (file) => {
  const CLOUDINARY_API_KEY = "839478495457115";
  const CLOUDINARY_API_SECRET = "H00NjZ74G8NAOGL-MxhCAaVge9g";

  try {
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", "integrada");
    data.append("cloud_name", "dfdinbti3"); // mantido como estava
    data.append("folder", "integrada");
    data.append("api_key", CLOUDINARY_API_KEY);
    data.append("api_secret", CLOUDINARY_API_SECRET);

    const res = await fetch(
      "https://api.cloudinary.com/v1_1/integrada/image/upload",
      { method: "POST", body: data }
    ).then((res) => res.json());

    if (res.error) throw new Error(res.error.message);

    return { data: res.secure_url, error: null };
  } catch (error) {
    console.log(error);
    return { data: null, error: "erro ao fazer upload" };
  }
};

/* =========================
   4) Cadastrar prestação
========================= */
const onSubmitCadastrarPrestacao = async (e) => {
  e.preventDefault();

  const file = caixaForms.documento?.files?.[0];
  if (!file) {
    alert("❌ Selecione um PDF!");
    return;
  }

  const uploadResult = await cloudinaryUpload(file);

  if (uploadResult.error) {
    alert("❌ Erro ao fazer upload do documento!");
    return;
  }

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
    alert("✅ Prestação cadastrada com sucesso!");
    caixaForms.reset();
    await listarPrestacoes(); // mantém aba ativa + atualiza
  } else {
    alert("❌ Erro ao cadastrar a prestação de contas!");
  }
};

caixaForms.addEventListener("submit", onSubmitCadastrarPrestacao);

/* =========================
   5) Abrir PDF
========================= */
async function onClickAbrirDocumento(documentoUrl) {
  try {
    const response = await fetch(documentoUrl);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  } catch (e) {
    console.error(e);
    alert("❌ Não foi possível abrir o documento.");
  }
}

/* =========================
   6) Excluir
========================= */
async function onClickExcluirDocumento(id) {
  const confirmar = confirm("Tem certeza que deseja excluir esta prestação de contas?");
  if (!confirmar) return;

  try {
    const res = await fetch(`${uri}/${id}`, { method: "DELETE" });

    if (res.status === 200 || res.ok) {
      alert("✅ Prestação de contas excluída com sucesso!");
      await listarPrestacoes();
    } else {
      alert("❌ Erro ao excluir a prestação de contas!");
    }
  } catch (error) {
    console.error("Erro ao excluir prestação de contas:", error);
    alert("❌ Erro ao excluir a prestação de contas!");
  }
}

/* =========================
   Init
========================= */
document.addEventListener("DOMContentLoaded", async () => {
  bindSalvarAbaAtiva();
  await Promise.all([carregarCondominios(), listarPrestacoes()]);
});
