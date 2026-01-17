// =========================
// scriptcondomino.js (COMPLETO) - edição em modal/card
// =========================

const uri = "https://integrada-api.onrender.com/clientescontroller";
const uriCondominio = "https://integrada-api.onrender.com/condominiocontroller";

// cadastro
const formNovo = document.querySelector("#formNovoProprietario");
const btnNovoSubmit = document.querySelector("#btnNovoSubmit");
const selectCondominioNovo = document.querySelector("#CondominioID");

// listagem
const cardsContainer = document.querySelector("#cardsContainer");
const inputBusca = document.querySelector("#inputBusca");
const qtdLista = document.querySelector("#qtdLista");
const emptyState = document.querySelector("#emptyState");

// modal
const modalEdit = document.querySelector("#modalEdit");
const formEditar = document.querySelector("#formEditarProprietario");
const btnSalvarEdicao = document.querySelector("#btnSalvarEdicao");
const selectCondominioEdit = document.querySelector("#CondominioIDEdit");

// cache
let cache = [];
let cacheCondominios = [];

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

  setTimeout(() => {
    formEditar?.querySelector("input[name='apartamento']")?.focus();
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
// Condomínios (selects)
// =========================
async function carregarCondominios() {
  try {
    const res = await fetch(uriCondominio);
    const condominios = await res.json();
    cacheCondominios = Array.isArray(condominios) ? condominios : [];

    preencherSelect(selectCondominioNovo, cacheCondominios);
    preencherSelect(selectCondominioEdit, cacheCondominios);
  } catch (err) {
    console.error("Erro ao carregar condomínios:", err);
    showToast({ type: "error", title: "Erro", message: "Falha ao carregar condomínios." });
  }
}

function preencherSelect(selectEl, lista) {
  if (!selectEl) return;
  selectEl.innerHTML = `<option value="">Selecione o Condomínio</option>`;
  lista.forEach((c) => {
    const opt = document.createElement("option");
    opt.value = c.condominioid;
    opt.textContent = c.nomecondominio;
    selectEl.appendChild(opt);
  });
}

// =========================
// CRUD - Novo Proprietário
// =========================
formNovo?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const payload = {
    apartamento: formNovo.apartamento.value.trim(),
    nome: formNovo.nome.value.trim(),
    cpf: formNovo.cpf.value.trim(),
    telefone: formNovo.telefone.value.trim(),
    email: formNovo.email.value.trim(),
    CondominioID: Number(formNovo.CondominioID.value),
  };

  if (!payload.apartamento || !payload.nome || !payload.cpf || !payload.telefone || !payload.email || !payload.CondominioID) {
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
      showToast({ type: "success", title: "Cadastrado", message: "Proprietário criado com sucesso." });
      formNovo.reset();
      await carregarProprietarios();
    } else {
      showToast({ type: "error", title: "Erro ao cadastrar", message: "Não foi possível cadastrar." });
    }
  } catch (err) {
    console.error(err);
    showToast({ type: "error", title: "Falha de conexão", message: "Verifique a API e tente novamente." });
  } finally {
    btnNovoSubmit.disabled = false;
  }
});

// =========================
// CRUD - Listar Proprietários
// =========================
async function carregarProprietarios() {
  try {
    cardsContainer.innerHTML = `<div class="col-12 text-center text-muted py-4">Carregando proprietários...</div>`;
    emptyState.classList.add("d-none");

    const res = await fetch(uri);
    const dados = await res.json();

    cache = Array.isArray(dados) ? dados : [];
    renderCards(cache);
  } catch (err) {
    console.error("Erro ao carregar proprietários:", err);
    cardsContainer.innerHTML = `<div class="col-12 text-center text-danger py-4">Erro ao carregar dados.</div>`;
    qtdLista.textContent = "0";
  }
}

function renderCards(lista) {
  cardsContainer.innerHTML = "";
  qtdLista.textContent = String(lista.length || 0);

  if (!lista.length) {
    emptyState.classList.remove("d-none");
    return;
  }
  emptyState.classList.add("d-none");

  lista.forEach((cliente) => {
    const condNome = cliente?.Condominio?.nomecondominio || "Não definido";

    const card = document.createElement("div");
    card.className = "col-lg-4 col-md-6 mb-4";

    card.innerHTML = `
      <div class="card paiva-prop-card h-100">
        <div class="card-body">
          <div class="d-flex align-items-start justify-content-between">
            <div>
              <h5 class="card-title mb-1">${escapeHtml(cliente.nome || "—")}</h5>
              <div class="text-muted small">
                <i class="fas fa-door-open mr-1"></i> ${escapeHtml(cliente.apartamento || "—")}
              </div>
            </div>
            <span class="badge badge-pill badge-light">OK</span>
          </div>

          <div class="paiva-prop-meta mt-3">
            <div><strong>CPF:</strong> <span>${escapeHtml(cliente.cpf || "—")}</span></div>
            <div><strong>Telefone:</strong> <span>${escapeHtml(cliente.telefone || "—")}</span></div>
            <div><strong>Email:</strong> <span class="text-break">${escapeHtml(cliente.email || "—")}</span></div>
            <div><strong>Condomínio:</strong> <span>${escapeHtml(condNome)}</span></div>
          </div>

          <div class="mt-3">
            <button class="btn btn-sm btn-danger paiva-btn-icon" data-edit="${cliente.clienteid}">
              <i class="fas fa-pen mr-1"></i> Editar
            </button>
          </div>
        </div>
      </div>
    `;

    cardsContainer.appendChild(card);
  });
}

// clique editar (delegação)
cardsContainer.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-edit]");
  if (!btn) return;
  const id = Number(btn.getAttribute("data-edit"));
  abrirEdicao(id);
});

// =========================
// EDITAR via MODAL
// =========================
function abrirEdicao(id) {
  const cliente = cache.find((c) => Number(c.clienteid) === Number(id));
  if (!cliente) {
    showToast({ type: "error", title: "Não encontrado", message: "Proprietário não localizado." });
    return;
  }

  formEditar.clienteid.value = cliente.clienteid;
  formEditar.apartamento.value = cliente.apartamento || "";
  formEditar.nome.value = cliente.nome || "";
  formEditar.cpf.value = cliente.cpf || "";
  formEditar.telefone.value = cliente.telefone || "";
  formEditar.email.value = cliente.email || "";
  selectCondominioEdit.value = cliente.CondominioID || "";

  openModal();
}

formEditar?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = formEditar.clienteid.value;

  const payload = {
    apartamento: formEditar.apartamento.value.trim(),
    nome: formEditar.nome.value.trim(),
    cpf: formEditar.cpf.value.trim(),
    telefone: formEditar.telefone.value.trim(),
    email: formEditar.email.value.trim(),
    CondominioID: Number(selectCondominioEdit.value),
  };

  if (!payload.apartamento || !payload.nome || !payload.cpf || !payload.telefone || !payload.email || !payload.CondominioID) {
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
      await carregarProprietarios();
    } else {
      showToast({ type: "error", title: "Erro ao atualizar", message: "Não foi possível salvar." });
    }
  } catch (err) {
    console.error(err);
    showToast({ type: "error", title: "Falha de conexão", message: "Verifique a API e tente novamente." });
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
    renderCards(cache);
    return;
  }

  const filtrado = cache.filter((c) => {
    const nome = (c.nome || "").toLowerCase();
    const apto = (c.apartamento || "").toLowerCase();
    const cpf = (c.cpf || "").toLowerCase();
    const tel = (c.telefone || "").toLowerCase();
    const email = (c.email || "").toLowerCase();
    const condNome = (c?.Condominio?.nomecondominio || "").toLowerCase();

    return (
      nome.includes(termo) ||
      apto.includes(termo) ||
      cpf.includes(termo) ||
      tel.includes(termo) ||
      email.includes(termo) ||
      condNome.includes(termo)
    );
  });

  renderCards(filtrado);
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
document.addEventListener("DOMContentLoaded", async () => {
  await carregarCondominios();
  await carregarProprietarios();
});
