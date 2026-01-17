/* =========================
   PRESTAÇÃO DE CONTAS (ADM)
   - Abas por condomínio
   - Aba "Todos"
   - Mantém Cloudinary como estava (API_KEY/SECRET no front)
========================= */

const caixaForms = document.querySelector("#caixaForms");
const selectCondominio = document.querySelector("#condominioSelect");

const uri = "https://integrada-api.onrender.com/prestacaocontascontroller";
const uriDev = "http://localhost:3000/prestacaocontascontroller";

const tabs = document.querySelector("#tabsCondominios");
const tabsContent = document.querySelector("#tabsCondominiosContent");

// ✅ NOVO: chave para guardar aba ativa
const LS_TAB_KEY = "prestacao_tab_ativa";

/* =========================
   1) Carregar condomínios no select
========================= */
const carregarCondominios = async () => {
  try {
    const response = await fetch(
      "https://integrada-api.onrender.com/condominiocontroller"
    );
    const condominios = await response.json();

    selectCondominio.innerHTML = `<option value="">Selecione o condomínio</option>`;

    condominios.forEach((c) => {
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
   Helpers
========================= */
function slugId(str) {
  return String(str || "")
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "")
    .toLowerCase();
}

function formatMes(mesISO) {
  return new Date(mesISO).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });
}

function renderTabelaPorCondominio(tbodyEl, lista) {
  tbodyEl.innerHTML = "";

  if (!lista.length) {
    tbodyEl.innerHTML = `
      <tr>
        <td colspan="3" class="text-center text-muted">
          Nenhuma prestação cadastrada para este condomínio.
        </td>
      </tr>`;
    return;
  }

  lista.forEach((e) => {
    const mesFormatado = formatMes(e.mes);

    const linkDocumento = e.documentoUrl
      ? `<button onclick="onClickAbrirDocumento('${e.documentoUrl}')" class="btn btn-sm btn-primary"> 📄 Abrir PDF </button>`
      : `<span class="text-muted">Sem documento</span>`;

    tbodyEl.innerHTML += `
      <tr>
        <td style="text-transform: capitalize;">${mesFormatado}</td>
        <td>${linkDocumento}</td>
        <td>
          <button class="btn btn-sm btn-danger" onclick="onClickExcluirDocumento('${e.prestacaoid}')">🗑️</button>
        </td>
      </tr>
    `;
  });
}

/* =========================
   ✅ NOVO: salvar a aba ativa
   (Bootstrap dispara esse evento quando troca de aba)
========================= */
if (tabs) {
  tabs.addEventListener("shown.bs.tab", (ev) => {
    // ev.target pode ser <button> (bs5) ou <a> (bs4); aqui usamos data-target
    const target = ev.target.getAttribute("data-target");
    if (target) {
      // "#pane-..." -> "pane-..."
      localStorage.setItem(LS_TAB_KEY, target.replace("#", ""));
    }
  });
}

/* =========================
   2) Listar prestações em abas
========================= */
const listarPrestacoes = async () => {
  try {
    const response = await fetch(uri);
    const prestacoes = await response.json();

    // ✅ NOVO: aplicar estilo premium/scroll horizontal só via classes
    // (você coloca o CSS depois)
    if (tabs) {
      tabs.classList.add("nav", "nav-pills", "tabs-premium__nav");
    }

    tabs.innerHTML = "";
    tabsContent.innerHTML = "";

    if (!prestacoes.length) {
      tabs.innerHTML = `
        <li class="nav-item">
          <button class="nav-link active" type="button">Sem registros</button>
        </li>`;
      tabsContent.innerHTML = `
        <div class="alert alert-warning">Nenhuma prestação cadastrada ainda.</div>`;
      return;
    }

    // ✅ NOVO: recuperar aba salva (se não existir, vai para Todos)
    const abaSalva = localStorage.getItem(LS_TAB_KEY) || "pane-todos";

    // Agrupar por condomínio (ID + Nome)
    const grupos = new Map();
    prestacoes.forEach((p) => {
      const key = `${p.CondominioID}|||${p.nomeCondominio || "Sem condomínio"}`;
      if (!grupos.has(key)) grupos.set(key, []);
      grupos.get(key).push(p);
    });

    // Ordenar por nome
    const gruposOrdenados = Array.from(grupos.entries()).sort((a, b) => {
      const nomeA = a[0].split("|||")[1].toLowerCase();
      const nomeB = b[0].split("|||")[1].toLowerCase();
      return nomeA.localeCompare(nomeB);
    });

    /* ===== ABA TODOS (primeira) ===== */
    const tabIdAll = "tab-todos";
    const paneIdAll = "pane-todos";

    const isActiveAll = abaSalva === paneIdAll;

    tabs.innerHTML += `
      <li class="nav-item" role="presentation">
        <button class="nav-link ${isActiveAll ? "active" : ""}" id="${tabIdAll}"
          data-toggle="tab" data-target="#${paneIdAll}"
          type="button" role="tab" aria-controls="${paneIdAll}" aria-selected="${isActiveAll ? "true" : "false"}">
          Todos
          <span class="badge badge-light ml-2">${prestacoes.length}</span>
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
    tbodyTodos.innerHTML = "";

    prestacoes.forEach((e) => {
      const mesFormatado = formatMes(e.mes);
      const nome = e.nomeCondominio || "—";

      const linkDocumento = e.documentoUrl
        ? `<button onclick="onClickAbrirDocumento('${e.documentoUrl}')" class="btn btn-sm btn-primary"> 📄 Abrir PDF </button>`
        : `<span class="text-muted">Sem documento</span>`;

      tbodyTodos.innerHTML += `
        <tr>
          <td>${nome}</td>
          <td style="text-transform: capitalize;">${mesFormatado}</td>
          <td>${linkDocumento}</td>
          <td>
            <button class="btn btn-sm btn-danger" onclick="onClickExcluirDocumento('${e.prestacaoid}')">🗑️</button>
          </td>
        </tr>
      `;
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
            type="button" role="tab" aria-controls="${paneId}" aria-selected="${isActive ? "true" : "false"}">
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
      renderTabelaPorCondominio(tbody, lista);
    });

    // ✅ NOVO: se a aba salva não existir mais (condomínio removido), volta pro Todos
    const existePaneSalva = document.querySelector(`#${abaSalva}`);
    if (!existePaneSalva) {
      localStorage.setItem(LS_TAB_KEY, "pane-todos");
    }
  } catch (error) {
    console.error("Erro ao carregar prestações:", error);
    tabs.innerHTML = "";
    tabsContent.innerHTML = `<div class="alert alert-danger">Erro ao carregar prestações.</div>`;
  }
};

Promise.all([carregarCondominios(), listarPrestacoes()]);

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
      {
        method: "POST",
        body: data,
      }
    ).then((res) => res.json());

    if (res.error) {
      throw new Error(res.error.message);
    }

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

  const uploadResult = await cloudinaryUpload(caixaForms.documento.files[0]);

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

  if (res.status === 201) {
    alert("✅ Prestação cadastrada com sucesso!");
    caixaForms.reset();
    await listarPrestacoes(); // ✅ atualiza a tela (mantém a aba ativa)
  } else {
    alert("❌ Erro ao cadastrar a prestação de contas!");
  }
};

caixaForms.addEventListener("submit", onSubmitCadastrarPrestacao);

/* =========================
   5) Abrir PDF
========================= */
const onClickAbrirDocumento = async (documentoUrl) => {
  const response = await fetch(documentoUrl);
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank");
};

/* =========================
   6) Excluir
========================= */
const onClickExcluirDocumento = async (id) => {
  const confirmar = confirm(
    "Tem certeza que deseja excluir esta prestação de contas?"
  );
  if (!confirmar) return;

  try {
    const res = await fetch(`${uri}/${id}`, { method: "DELETE" });

    if (res.status === 200) {
      alert("✅ Prestação de contas excluída com sucesso!");
      await listarPrestacoes(); // ✅ atualiza a tela (mantém a aba ativa)
    } else {
      alert("❌ Erro ao excluir a prestação de contas!");
    }
  } catch (error) {
    console.error("Erro ao excluir prestação de contas:", error);
    alert("❌ Erro ao excluir a prestação de contas!");
  }
};
