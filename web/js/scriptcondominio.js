// =========================
// scriptcondominio.js (COMPLETO)
// =========================

const caixaForms = document.querySelector("#caixaForms");
const uri = "https://integrada-api.onrender.com/condominiocontroller";

const tbody = document.querySelector("#cliente");
const inputBusca = document.querySelector("#inputBusca");
const qtdLista = document.querySelector("#qtdLista");
const emptyState = document.querySelector("#emptyState");

const btnSubmit = document.querySelector("#btnSubmit");
const btnCancelarEdicao = document.querySelector("#btnCancelarEdicao");
const badgeModoEdicao = document.querySelector("#badgeModoEdicao");

let editando = false;
let idEditando = null;
let cache = []; // lista em memória p/ filtro

// =========================
// TOAST
// =========================
const toast = document.getElementById("toast");
const toastTitle = document.getElementById("toastTitle");
const toastMsg = document.getElementById("toastMsg");
const toastIcon = document.getElementById("toastIcon");
const toastClose = document.getElementById("toastClose");
let toastTimer = null;

function showToast({ type = "success", title = "Tudo certo", message = "" }) {
  // type: success | error | info | warn
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

// =========================
// UI helpers
// =========================
function setModoEdicao(ativo) {
  editando = ativo;

  if (!ativo) {
    idEditando = null;
    caixaForms.reset();

    badgeModoEdicao.classList.add("d-none");
    btnCancelarEdicao.classList.add("d-none");

    btnSubmit.innerHTML = `<i class="fas fa-plus mr-2"></i> Cadastrar`;
    btnSubmit.classList.remove("btn-warning");
    btnSubmit.classList.add("btn-primary");
    return;
  }

  badgeModoEdicao.classList.remove("d-none");
  btnCancelarEdicao.classList.remove("d-none");

  btnSubmit.innerHTML = `<i class="fas fa-save mr-2"></i> Salvar alterações`;
  btnSubmit.classList.remove("btn-primary");
  btnSubmit.classList.add("btn-warning");
}

btnCancelarEdicao?.addEventListener("click", () => {
  setModoEdicao(false);
  showToast({ type: "info", title: "Edição cancelada", message: "Você voltou para o modo de cadastro." });
});

// =========================
// CRUD
// =========================
caixaForms.addEventListener("submit", async (e) => {
  e.preventDefault();

  const payload = {
    nomecondominio: caixaForms.nomecondominio.value.trim(),
    endereco: caixaForms.endereco.value.trim(),
    telefone: caixaForms.telefone.value.trim(),
  };

  if (!payload.nomecondominio || !payload.endereco || !payload.telefone) {
    showToast({ type: "warn", title: "Atenção", message: "Preencha todos os campos." });
    return;
  }

  btnSubmit.disabled = true;

  try {
    if (!editando) {
      const res = await fetch(uri, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.status === 201 || res.ok) {
        showToast({ type: "success", title: "Condomínio cadastrado", message: "Registro criado com sucesso." });
        caixaForms.reset();
        await listarCondominios();
      } else {
        showToast({ type: "error", title: "Erro ao cadastrar", message: "Não foi possível criar o condomínio." });
      }
    } else {
      const res = await fetch(`${uri}/${idEditando}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.status === 200 || res.ok) {
        showToast({ type: "success", title: "Condomínio atualizado", message: "Alterações salvas com sucesso." });
        setModoEdicao(false);
        await listarCondominios();
      } else {
        showToast({ type: "error", title: "Erro ao atualizar", message: "Não foi possível salvar as alterações." });
      }
    }
  } catch (err) {
    console.error(err);
    showToast({ type: "error", title: "Falha de conexão", message: "Verifique a internet / API e tente novamente." });
  } finally {
    btnSubmit.disabled = false;
  }
});

// Listar
async function listarCondominios() {
  try {
    tbody.innerHTML = `
      <tr>
        <td colspan="4" class="text-center text-muted py-4">Carregando condomínios...</td>
      </tr>
    `;
    emptyState.classList.add("d-none");

    const res = await fetch(uri);
    const dados = await res.json();

    cache = Array.isArray(dados) ? dados : [];
    renderTabela(cache);
  } catch (err) {
    console.error(err);
    tbody.innerHTML = `
      <tr>
        <td colspan="4" class="text-center text-danger py-4">Erro ao carregar condomínios.</td>
      </tr>
    `;
    qtdLista.textContent = "0";
  }
}

// Render
function renderTabela(lista) {
  tbody.innerHTML = "";

  qtdLista.textContent = String(lista.length || 0);

  if (!lista.length) {
    emptyState.classList.remove("d-none");
    tbody.innerHTML = "";
    return;
  }

  emptyState.classList.add("d-none");

  lista.forEach((c) => {
    const id = c.condominioid;
    const nome = c.nomecondominio || "—";
    const endereco = c.endereco || "—";
    const telefone = c.telefone || "—";

    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td class="font-weight-bold">${escapeHtml(nome)}</td>
      <td>${escapeHtml(endereco)}</td>
      <td>${escapeHtml(telefone)}</td>
      <td>
        <div class="paiva-actions">
          <button class="btn btn-sm btn-primary paiva-btn-icon" data-action="editar" data-id="${id}">
            <i class="fas fa-pen mr-1"></i> Editar
          </button>
          ${editando && idEditando === id
        ? `<span class="badge badge-pill badge-warning">Editando</span>`
        : `<span class="badge badge-pill badge-light">OK</span>`}
        </div>
      </td>
    `;

    tbody.appendChild(tr);
  });
}

// Delegação de evento para botões da tabela
tbody.addEventListener("click", async (e) => {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;

  const action = btn.getAttribute("data-action");
  const id = Number(btn.getAttribute("data-id"));

  if (action === "editar") {
    editarCondominio(id);
  }
});

// Editar
function editarCondominio(id) {
  const cond = cache.find((x) => Number(x.condominioid) === Number(id));
  if (!cond) {
    showToast({ type: "error", title: "Não encontrado", message: "Condomínio não localizado." });
    return;
  }

  caixaForms.nomecondominio.value = cond.nomecondominio || "";
  caixaForms.endereco.value = cond.endereco || "";
  caixaForms.telefone.value = cond.telefone || "";

  idEditando = id;
  setModoEdicao(true);

  // scroll suave pro topo (form)
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Busca
inputBusca?.addEventListener("input", () => {
  const termo = (inputBusca.value || "").trim().toLowerCase();

  if (!termo) {
    renderTabela(cache);
    return;
  }

  const filtrado = cache.filter((c) => {
    const nome = (c.nomecondominio || "").toLowerCase();
    const end = (c.endereco || "").toLowerCase();
    const tel = (c.telefone || "").toLowerCase();
    return nome.includes(termo) || end.includes(termo) || tel.includes(termo);
  });

  renderTabela(filtrado);
});

// util: evita injeção de HTML na tabela
function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// init
listarCondominios();
