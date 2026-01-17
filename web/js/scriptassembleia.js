// =========================
// scriptassembleia.js (COMPLETO) - Paiva Tech + edição em modal/card
// =========================

const formAssembleia = document.querySelector("#formAssembleia");
const selectCondominio = document.querySelector("#condominioSelect");
const cardsContainer = document.querySelector("#cardsContainer");
const inputBusca = document.querySelector("#inputBusca");
const qtdLista = document.querySelector("#qtdLista");
const emptyState = document.querySelector("#emptyState");
const btnSubmit = document.querySelector("#btnSubmit");
const documentoInput = document.querySelector("#documento");
const fileHint = document.querySelector("#fileHint");

// modal edit
const modalEdit = document.querySelector("#modalEdit");
const formEditar = document.querySelector("#formEditarAssembleia");
const selectCondominioEdit = document.querySelector("#condominioSelectEdit");
const documentoEditInput = document.querySelector("#documentoEdit");
const fileHintEdit = document.querySelector("#fileHintEdit");
const btnSalvarEdicao = document.querySelector("#btnSalvarEdicao");

// URIs
const uriCondominios = "https://integrada-api.onrender.com/condominiocontroller";
const uriAssembleias = "https://integrada-api.onrender.com/assembleiascontroller";

// cache
let cacheAssembleias = [];
let cacheCondominios = [];

// =========================
// TOAST (mesmo padrão)
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
function openModal() {
  modalEdit.classList.remove("d-none");
  document.body.classList.add("paiva-modal-open");
  modalEdit.setAttribute("aria-hidden", "false");
  setTimeout(() => formEditar?.querySelector("input[name='descricao']")?.focus(), 50);
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
// UI helpers
documentoInput?.addEventListener("change", () => {
  const f = documentoInput.files?.[0];
  fileHint.textContent = f ? `Selecionado: ${f.name}` : "Nenhum arquivo selecionado.";
});

documentoEditInput?.addEventListener("change", () => {
  const f = documentoEditInput.files?.[0];
  fileHintEdit.textContent = f ? `Substituir por: ${f.name}` : "Mantendo o documento atual.";
});

// =========================
// Carregar condomínios
async function carregarCondominios() {
  try {
    const res = await fetch(uriCondominios);
    const dados = await res.json();
    cacheCondominios = Array.isArray(dados) ? dados : [];

    preencherSelect(selectCondominio, cacheCondominios);
    preencherSelect(selectCondominioEdit, cacheCondominios);
  } catch (error) {
    console.error("Erro ao carregar condomínios:", error);
    showToast({ type: "error", title: "Erro", message: "Falha ao carregar condomínios." });
  }
}

function preencherSelect(selectEl, lista) {
  if (!selectEl) return;
  selectEl.innerHTML = `<option value="">Selecione o condomínio</option>`;
  lista.forEach((cond) => {
    const opt = document.createElement("option");
    opt.value = cond.condominioid;
    opt.textContent = cond.nomecondominio;
    selectEl.appendChild(opt);
  });
}

// =========================
// Cloudinary upload (MANTIDO)
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

// abrir documento
async function onClickAbrirDocumento(documentoUrl) {
  try {
    const response = await fetch(documentoUrl);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  } catch (err) {
    console.error(err);
    showToast({ type: "error", title: "Erro", message: "Falha ao abrir documento." });
  }
}

// =========================
// Listar assembleias (cards)
async function listarAssembleias() {
  try {
    cardsContainer.innerHTML = `<div class="col-12 text-center text-muted py-4">Carregando assembleias...</div>`;
    emptyState.classList.add("d-none");

    const res = await fetch(uriAssembleias);
    const dados = await res.json();
    cacheAssembleias = Array.isArray(dados) ? dados : [];

    renderCards(cacheAssembleias);
  } catch (error) {
    console.error("Erro ao listar assembleias:", error);
    cardsContainer.innerHTML = `<div class="col-12 text-center text-danger py-4">Erro ao carregar assembleias.</div>`;
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

  lista.forEach((item) => {
    const id = item.assembleiaid ?? item.id;
    const descricao = item.descricao || "—";
    const nomeCondominio = item.nomeCondominio || item?.Condominio?.nomecondominio || "—";
    const documentoUrl = item.documentoUrl;

    const card = document.createElement("div");
    card.className = "col-lg-4 col-md-6 mb-4";

    card.innerHTML = `
      <div class="card paiva-asm-card h-100">
        <div class="card-body">
          <div class="d-flex align-items-start justify-content-between">
            <div>
              <h5 class="card-title mb-1">${escapeHtml(descricao)}</h5>
              <div class="text-muted small">
                <i class="fas fa-building mr-1"></i> ${escapeHtml(nomeCondominio)}
              </div>
            </div>
            <span class="badge badge-pill badge-light">OK</span>
          </div>

          <div class="paiva-asm-meta mt-3">
            <div><strong>Documento:</strong> ${documentoUrl ? "Anexado" : "Não anexado"}</div>
          </div>

          <div class="mt-3 d-flex flex-wrap gap-2">
            <button class="btn btn-sm btn-primary" data-open="${encodeURIComponent(documentoUrl || "")}" ${documentoUrl ? "" : "disabled"}>
              <i class="fas fa-file-alt mr-1"></i> Abrir
            </button>

            <button class="btn btn-sm btn-danger paiva-btn-icon" data-edit="${id}">
              <i class="fas fa-pen mr-1"></i> Editar
            </button>

            <button class="btn btn-sm btn-outline-danger" data-del="${id}">
              <i class="fas fa-trash mr-1"></i>
            </button>
          </div>
        </div>
      </div>
    `;

    cardsContainer.appendChild(card);
  });
}

// clique ações
cardsContainer.addEventListener("click", async (e) => {
  const btnOpen = e.target.closest("[data-open]");
  const btnEdit = e.target.closest("[data-edit]");
  const btnDel = e.target.closest("[data-del]");

  if (btnOpen) {
    const url = decodeURIComponent(btnOpen.getAttribute("data-open") || "");
    if (url) onClickAbrirDocumento(url);
    return;
  }

  if (btnEdit) {
    const id = Number(btnEdit.getAttribute("data-edit"));
    abrirEdicao(id);
    return;
  }

  if (btnDel) {
    const id = Number(btnDel.getAttribute("data-del"));
    await excluirAssembleia(id);
  }
});

// =========================
// Criar assembleia
formAssembleia?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const descricao = formAssembleia.descricao.value.trim();
  const CondominioID = selectCondominio.value;
  const file = formAssembleia.documento.files?.[0];

  if (!descricao || !CondominioID || !file) {
    showToast({ type: "warn", title: "Atenção", message: "Preencha tudo e anexe um documento." });
    return;
  }

  btnSubmit.disabled = true;

  const uploadResult = await cloudinaryUpload(file);
  if (uploadResult.error) {
    showToast({ type: "error", title: "Upload falhou", message: "Erro ao enviar documento." });
    btnSubmit.disabled = false;
    return;
  }

  try {
    const res = await fetch(uriAssembleias, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        descricao,
        CondominioID,
        documentoUrl: uploadResult.data,
      }),
    });

    if (res.status === 201 || res.ok) {
      showToast({ type: "success", title: "Cadastrado", message: "Assembleia cadastrada com sucesso." });
      formAssembleia.reset();
      fileHint.textContent = "Nenhum arquivo selecionado.";
      await listarAssembleias();
    } else {
      showToast({ type: "error", title: "Erro", message: "Não foi possível cadastrar a assembleia." });
    }
  } catch (error) {
    console.error("Erro ao enviar assembleia:", error);
    showToast({ type: "error", title: "Falha", message: "Falha ao enviar assembleia." });
  } finally {
    btnSubmit.disabled = false;
  }
});

// =========================
// Editar (abre modal/card)
function abrirEdicao(id) {
  const item = cacheAssembleias.find((x) => Number(x.assembleiaid ?? x.id) === Number(id));
  if (!item) {
    showToast({ type: "error", title: "Não encontrado", message: "Assembleia não localizada." });
    return;
  }

  formEditar.id.value = item.assembleiaid ?? item.id;
  formEditar.descricao.value = item.descricao || "";
  formEditar.documentoUrlAtual.value = item.documentoUrl || "";

  // tenta pegar o CondominioID caso exista, senão fica vazio
  const condId = item.CondominioID || item.condominioId || item.condominioid || "";
  selectCondominioEdit.value = String(condId);

  fileHintEdit.textContent = "Mantendo o documento atual.";
  documentoEditInput.value = "";

  openModal();
}

formEditar?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = formEditar.id.value;
  const descricao = formEditar.descricao.value.trim();
  const CondominioID = selectCondominioEdit.value;
  const file = documentoEditInput.files?.[0];
  let documentoUrl = formEditar.documentoUrlAtual.value || "";

  if (!descricao || !CondominioID) {
    showToast({ type: "warn", title: "Atenção", message: "Preencha descrição e condomínio." });
    return;
  }

  btnSalvarEdicao.disabled = true;

  // se selecionou novo documento, faz upload
  if (file) {
    const uploadResult = await cloudinaryUpload(file);
    if (uploadResult.error) {
      showToast({ type: "error", title: "Upload falhou", message: "Erro ao enviar documento." });
      btnSalvarEdicao.disabled = false;
      return;
    }
    documentoUrl = uploadResult.data;
  }

  try {
    const res = await fetch(`${uriAssembleias}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ descricao, CondominioID, documentoUrl }),
    });

    if (res.status === 200 || res.ok) {
      showToast({ type: "success", title: "Atualizado", message: "Alterações salvas com sucesso." });
      closeModal();
      await listarAssembleias();
    } else {
      showToast({ type: "error", title: "Erro", message: "Não foi possível atualizar." });
    }
  } catch (err) {
    console.error(err);
    showToast({ type: "error", title: "Falha", message: "Falha ao atualizar assembleia." });
  } finally {
    btnSalvarEdicao.disabled = false;
  }
});

// =========================
// Excluir
async function excluirAssembleia(id) {
  const confirmar = confirm("Tem certeza que deseja excluir esta assembleia?");
  if (!confirmar) return;

  try {
    const res = await fetch(`${uriAssembleias}/${id}`, { method: "DELETE" });

    if (res.status === 200 || res.ok) {
      showToast({ type: "success", title: "Excluído", message: "Assembleia removida com sucesso." });
      await listarAssembleias();
    } else {
      showToast({ type: "error", title: "Erro", message: "Não foi possível excluir." });
    }
  } catch (error) {
    console.error("Erro ao excluir:", error);
    showToast({ type: "error", title: "Falha", message: "Falha ao excluir." });
  }
}

// =========================
// Busca
inputBusca?.addEventListener("input", () => {
  const termo = (inputBusca.value || "").trim().toLowerCase();

  if (!termo) {
    renderCards(cacheAssembleias);
    return;
  }

  const filtrado = cacheAssembleias.filter((a) => {
    const desc = (a.descricao || "").toLowerCase();
    const cond = (a.nomeCondominio || a?.Condominio?.nomecondominio || "").toLowerCase();
    return desc.includes(termo) || cond.includes(termo);
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
  await listarAssembleias();
});
