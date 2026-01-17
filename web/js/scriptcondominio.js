// =========================
// scriptcondominio.js (COMPLETO) - edição em modal/card
// =========================

const uri = "https://integrada-api.onrender.com/condominiocontroller";

// forms
const formNovo = document.querySelector("#formNovoCondominio");
const btnNovoSubmit = document.querySelector("#btnNovoSubmit");

const formEditar = document.querySelector("#formEditarCondominio");
const btnSalvarEdicao = document.querySelector("#btnSalvarEdicao");

// list/table
const tbody = document.querySelector("#cliente");
const inputBusca = document.querySelector("#inputBusca");
const qtdLista = document.querySelector("#qtdLista");
const emptyState = document.querySelector("#emptyState");

// modal
const modalEdit = document.querySelector("#modalEdit");

// cache
let cache = [];

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
// MODAL helpers
// =========================
function openModal() {
  modalEdit.classList.remove("d-none");
  document.body.classList.add("paiva-modal-open");
  modalEdit.setAttribute("aria-hidden", "false");

  // foco no primeiro input
  setTimeout(() => {
    const first = formEditar.querySelector("input[name='nomecondominio']");
    first?.focus();
  }, 50);
}

function closeModal() {
  modalEdit.classList.add("d-none");
  document.body.classList.remove("paiva-modal-open");
  modalEdit.setAttribute("aria-hidden", "true");
}

modalEdit.addEventListener("click", (e) => {
  const close = e.target.closest("[data-close='true']");
  if (close) closeModal();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !modalEdit.classList.contains("d-none")) closeModal();
});

// =========================
// CRUD - Novo
// =========================
formNovo?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const payload = {
    nomecondominio: formNovo.nomecondominio.value.trim(),
    endereco: formNovo.endereco.value.trim(),
    telefone: formNovo.telefone.value.trim(),
  };

  if (!payload.nomecondominio || !payload.endereco || !payload.telefone) {
    showToast({ type: "warn", title: "Atenção", message: "Preencha todos os campos." });
    return;
  }

  btnNovoSubmit.disabled = true;

  try {
    const res = await fetch(uri, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.status === 201 || res.ok) {
      showToast({ type: "success", title: "Condomínio cadastrado", message: "Registro criado com sucesso." });
      formNovo.reset();
      await listarCondominios();
    } else {
      showToast({ type: "error", title: "Erro ao cadastrar", message: "Não foi possível criar o condomínio." });
    }
  } catch (err) {
    console.error(err);
    showToast({ type: "error", title: "Falha de conexão", message: "Verifique a internet / API e tente novamente." });
  } finally {
    btnNovoSubmit.disabled = false;
  }
});

// =========================
// CRUD - Listar
// =========================
async function listarCondominios() {
  try {
    tbody.innerHTML = `
      <tr><td colspan="4" class="text-center text-muted py-4">Carregando condomínios...</td></tr>
    `;
    emptyState.classList.add("d-none");

    const res = await fetch(uri);
    const dados = await res.json();

    cache = Array.isArray(dados) ? dados : [];
    renderTabela(cache);
  } catch (err) {
    console.error(err);
    tbody.innerHTML = `
      <tr><td colspan="4" class="text-center text-danger py-4">Erro ao carregar condomínios.</td></tr>
    `;
    qtdLista.textContent = "0";
  }
}

function renderTabela(lista) {
  tbody.innerHTML = "";
  qtdLista.textContent = String(lista.length || 0);

  if (!lista.length) {
    emptyState.classList.remove("d-none");
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
          <span class="badge badge-pill badge-light">OK</span>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Delegação - editar
tbody.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;

  const action = btn.getAttribute("data-action");
  const id = Number(btn.getAttribute("data-id"));

  if (action === "editar") abrirEdicao(id);
});

function abrirEdicao(id) {
  const cond = cache.find((x) => Number(x.condominioid) === Number(id));
  if (!cond) {
    showToast({ type: "error", title: "Não encontrado", message: "Condomínio não localizado." });
    return;
  }

  formEditar.condominioid.value = cond.condominioid;
  formEditar.nomecondominio.value = cond.nomecondominio || "";
  formEditar.endereco.value = cond.endereco || "";
  formEditar.telefone.value = cond.telefone || "";

  openModal();
}

// =========================
// CRUD - Salvar Edição
// =========================
formEditar?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = formEditar.condominioid.value;

  const payload = {
    nomecondominio: formEditar.nomecondominio.value.trim(),
    endereco: formEditar.endereco.value.trim(),
    telefone: formEditar.telefone.value.trim(),
  };

  if (!payload.nomecondominio || !payload.endereco || !payload.telefone) {
    showToast({ type: "warn", title: "Atenção", message: "Preencha todos os campos." });
    return;
  }

  btnSalvarEdicao.disabled = true;

  try {
    const res = await fetch(`${uri}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.status === 200 || res.ok) {
      showToast({ type: "success", title: "Atualizado", message: "Alterações salvas com sucesso." });
      closeModal();
      await listarCondominios();
    } else {
      showToast({ type: "error", title: "Erro ao atualizar", message: "Não foi possível salvar as alterações." });
    }
  } catch (err) {
    console.error(err);
    showToast({ type: "error", title: "Falha de conexão", message: "Verifique a internet / API e tente novamente." });
  } finally {
    btnSalvarEdicao.disabled = false;
  }
});

// =========================
// Busca
// =========================
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

// util
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
