// =========================
// scriptinquilino.js (COMPLETO) - edição em modal/card
// =========================

const uri = "https://integrada-api.onrender.com/inquilinoscontroller";
const uriCondominio = "https://integrada-api.onrender.com/condominiocontroller";
const uriClientes = "https://integrada-api.onrender.com/clientescontroller";

// form novo
const formNovo = document.querySelector("#formNovoInquilino");
const btnNovoSubmit = document.querySelector("#btnNovoSubmit");
const selectCondNovo = document.querySelector("#CondominioID");
const selectPropNovo = document.querySelector("#ClienteID");

// listagem
const cardsContainer = document.querySelector("#cardsContainer");
const inputBusca = document.querySelector("#inputBusca");
const qtdLista = document.querySelector("#qtdLista");
const emptyState = document.querySelector("#emptyState");

// modal
const modalEdit = document.querySelector("#modalEdit");
const formEditar = document.querySelector("#formEditarInquilino");
const btnSalvarEdicao = document.querySelector("#btnSalvarEdicao");
const selectCondEdit = document.querySelector("#CondominioIDEdit");
const selectPropEdit = document.querySelector("#ClienteIDEdit");

// cache
let cacheInq = [];
let cacheConds = [];
let cacheProps = [];

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
// MODAL
// =========================
function openModal() {
  modalEdit.classList.remove("d-none");
  document.body.classList.add("paiva-modal-open");
  modalEdit.setAttribute("aria-hidden", "false");
  setTimeout(() => formEditar?.querySelector("input[name='apartamento']")?.focus(), 50);
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
// CARREGAR BASES
// =========================
async function carregarCondominios() {
  const res = await fetch(uriCondominio);
  const data = await res.json();
  cacheConds = Array.isArray(data) ? data : [];

  preencherSelect(selectCondNovo, cacheConds, "Selecione o Condomínio");
  preencherSelect(selectCondEdit, cacheConds, "Selecione o Condomínio");
}

async function carregarProprietarios() {
  const res = await fetch(uriClientes);
  const data = await res.json();
  cacheProps = Array.isArray(data) ? data : [];

  // inicial: lista completa, mas a gente filtra ao escolher condomínio
  preencherSelect(selectPropNovo, cacheProps, "Selecione o proprietário", (c) => `${c.nome} (Ap: ${c.apartamento})`, "clienteid");
  preencherSelect(selectPropEdit, cacheProps, "Selecione o proprietário", (c) => `${c.nome} (Ap: ${c.apartamento})`, "clienteid");
}

function preencherSelect(selectEl, lista, placeholder, labelFn, valueKey = "condominioid") {
  if (!selectEl) return;

  selectEl.innerHTML = `<option value="">${placeholder}</option>`;
  lista.forEach((item) => {
    const opt = document.createElement("option");
    opt.value = item[valueKey];
    opt.textContent = labelFn ? labelFn(item) : item.nomecondominio;
    selectEl.appendChild(opt);
  });
}

// =========================
// FILTRO PROPRIETARIO POR CONDOMINIO
// =========================
function filtrarProprietariosPorCondominio(condId, selectEl) {
  const id = Number(condId);
  if (!id || !selectEl) {
    preencherSelect(selectEl, cacheProps, "Selecione o proprietário", (c) => `${c.nome} (Ap: ${c.apartamento})`, "clienteid");
    return;
  }

  // se sua API retorna CondominioID no cliente, filtramos
  const filtrados = cacheProps.filter((p) => Number(p.CondominioID) === id);

  // fallback: se não vier CondominioID, mostra todos mesmo
  const finalList = filtrados.length ? filtrados : cacheProps;

  preencherSelect(selectEl, finalList, "Selecione o proprietário", (c) => `${c.nome} (Ap: ${c.apartamento})`, "clienteid");
}

// change selects
selectCondNovo?.addEventListener("change", () => {
  filtrarProprietariosPorCondominio(selectCondNovo.value, selectPropNovo);
});

selectCondEdit?.addEventListener("change", () => {
  filtrarProprietariosPorCondominio(selectCondEdit.value, selectPropEdit);
});

// =========================
// NOVO INQUILINO
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
    ClienteID: Number(formNovo.ClienteID.value),
  };

  if (!payload.apartamento || !payload.nome || !payload.cpf || !payload.telefone || !payload.email || !payload.CondominioID || !payload.ClienteID) {
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
      showToast({ type: "success", title: "Cadastrado", message: "Inquilino criado com sucesso." });
      formNovo.reset();
      // reset selects
      await carregarInquilinos();
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
// LISTAR
// =========================
async function carregarInquilinos() {
  try {
    cardsContainer.innerHTML = `<div class="col-12 text-center text-muted py-4">Carregando inquilinos...</div>`;
    emptyState.classList.add("d-none");

    const res = await fetch(uri);
    const dados = await res.json();

    cacheInq = Array.isArray(dados) ? dados : [];
    renderCards(cacheInq);
  } catch (err) {
    console.error("Erro ao carregar inquilinos:", err);
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

  lista.forEach((i) => {
    const condNome =
      i?.Condominio?.nomecondominio ||
      i?.condominioNome ||
      "Não definido";

    const propNome =
      i?.Cliente?.nome ||
      i?.proprietarioNome ||
      "Não definido";

    const card = document.createElement("div");
    card.className = "col-lg-4 col-md-6 mb-4";

    card.innerHTML = `
      <div class="card paiva-inq-card h-100">
        <div class="card-body">
          <div class="d-flex align-items-start justify-content-between">
            <div>
              <h5 class="card-title mb-1">${escapeHtml(i.nome || "—")}</h5>
              <div class="text-muted small">
                <i class="fas fa-door-open mr-1"></i> ${escapeHtml(i.apartamento || "—")}
              </div>
            </div>
            <span class="badge badge-pill badge-light">OK</span>
          </div>

          <div class="paiva-inq-meta mt-3">
            <div><strong>CPF:</strong> <span>${escapeHtml(i.cpf || "—")}</span></div>
            <div><strong>Telefone:</strong> <span>${escapeHtml(i.telefone || "—")}</span></div>
            <div><strong>Email:</strong> <span class="text-break">${escapeHtml(i.email || "—")}</span></div>
            <div><strong>Condomínio:</strong> <span>${escapeHtml(condNome)}</span></div>
            <div><strong>Proprietário:</strong> <span>${escapeHtml(propNome)}</span></div>
          </div>

          <div class="mt-3">
            <button class="btn btn-sm btn-danger paiva-btn-icon" data-edit="${i.id}">
              <i class="fas fa-pen mr-1"></i> Editar
            </button>
          </div>
        </div>
      </div>
    `;

    cardsContainer.appendChild(card);
  });
}

// clique editar
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
  const inq = cacheInq.find((x) => Number(x.id) === Number(id));
  if (!inq) {
    showToast({ type: "error", title: "Não encontrado", message: "Inquilino não localizado." });
    return;
  }

  formEditar.id.value = inq.id;
  formEditar.apartamento.value = inq.apartamento || "";
  formEditar.nome.value = inq.nome || "";
  formEditar.cpf.value = inq.cpf || "";
  formEditar.telefone.value = inq.telefone || "";
  formEditar.email.value = inq.email || "";

  // cond/proprietario
  selectCondEdit.value = inq.condominioId || inq.CondominioID || "";
  filtrarProprietariosPorCondominio(selectCondEdit.value, selectPropEdit);
  selectPropEdit.value = inq.proprietarioId || inq.ClienteID || "";

  openModal();
}

formEditar?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = formEditar.id.value;

  const payload = {
    apartamento: formEditar.apartamento.value.trim(),
    nome: formEditar.nome.value.trim(),
    cpf: formEditar.cpf.value.trim(),
    telefone: formEditar.telefone.value.trim(),
    email: formEditar.email.value.trim(),
    CondominioID: Number(selectCondEdit.value),
    ClienteID: Number(selectPropEdit.value),
  };

  if (!payload.apartamento || !payload.nome || !payload.cpf || !payload.telefone || !payload.email || !payload.CondominioID || !payload.ClienteID) {
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
      await carregarInquilinos();
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
    renderCards(cacheInq);
    return;
  }

  const filtrado = cacheInq.filter((i) => {
    const nome = (i.nome || "").toLowerCase();
    const apto = (i.apartamento || "").toLowerCase();
    const cpf = (i.cpf || "").toLowerCase();
    const tel = (i.telefone || "").toLowerCase();
    const email = (i.email || "").toLowerCase();
    const condNome = (i?.Condominio?.nomecondominio || i?.condominioNome || "").toLowerCase();
    const propNome = (i?.Cliente?.nome || i?.proprietarioNome || "").toLowerCase();

    return (
      nome.includes(termo) ||
      apto.includes(termo) ||
      cpf.includes(termo) ||
      tel.includes(termo) ||
      email.includes(termo) ||
      condNome.includes(termo) ||
      propNome.includes(termo)
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

  // filtra proprietários no select novo ao mudar condomínio
  filtrarProprietariosPorCondominio(selectCondNovo.value, selectPropNovo);

  await carregarInquilinos();
});
