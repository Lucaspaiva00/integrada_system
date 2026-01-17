const formComunicado = document.querySelector("#formComunicado");
const selectCondominio = document.querySelector("#CondominioID");

const cardsContainer = document.querySelector("#cardsContainer");
const emptyState = document.querySelector("#emptyState");
const qtdLista = document.querySelector("#qtdLista");
const inputBusca = document.querySelector("#inputBusca");

const modalEdit = document.querySelector("#modalEdit");
const formEditar = document.querySelector("#formEditarComunicado");
const selectCondominioEdit = document.querySelector("#CondominioIDEdit");

const fileHint = document.querySelector("#fileHint");
const fileHintEdit = document.querySelector("#fileHintEdit");

const toastEl = document.querySelector("#toast");
const toastTitle = document.querySelector("#toastTitle");
const toastMsg = document.querySelector("#toastMsg");
const toastIcon = document.querySelector("#toastIcon");
const toastClose = document.querySelector("#toastClose");

// ✅ URLs
const uriComunicadosController = "https://integrada-api.onrender.com/comunicadoscontroller";
const uriCondominio = "https://integrada-api.onrender.com/condominiocontroller";

// cache
let comunicadosCache = [];

// ---------------------------
// TOAST
// ---------------------------
let toastTimer = null;

function showToast(type, title, msg) {
  // type: success | error | info
  toastEl.classList.remove("show", "success", "error", "info");
  toastEl.classList.add("show", type);

  toastTitle.textContent = title || "Aviso";
  toastMsg.textContent = msg || "";

  toastIcon.innerHTML =
    type === "success" ? `<i class="fas fa-check"></i>` :
      type === "error" ? `<i class="fas fa-times"></i>` :
        `<i class="fas fa-info"></i>`;

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastEl.classList.remove("show");
  }, 3500);
}

toastClose?.addEventListener("click", () => toastEl.classList.remove("show"));

// ---------------------------
// MODAL helpers
// ---------------------------
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

modalEdit.addEventListener("click", (e) => {
  const el = e.target;
  if (el && el.getAttribute && el.getAttribute("data-close") === "true") closeModal();
});

// ESC fecha modal
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !modalEdit.classList.contains("d-none")) closeModal();
});

// ---------------------------
// Form hints
// ---------------------------
document.querySelector("#documento")?.addEventListener("change", (e) => {
  const f = e.target.files?.[0];
  fileHint.textContent = f ? `Selecionado: ${f.name}` : "Nenhum arquivo selecionado.";
});

document.querySelector("#documentoEdit")?.addEventListener("change", (e) => {
  const f = e.target.files?.[0];
  fileHintEdit.textContent = f ? `Selecionado: ${f.name}` : "Mantendo o documento atual.";
});

// ---------------------------
// Cloudinary upload (mantendo suas chaves)
// ---------------------------
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

// ---------------------------
// Helpers
// ---------------------------
function formatDateISOToBR(iso) {
  if (!iso) return "—";
  // se vier yyyy-mm-dd
  if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
    const [y, m, d] = iso.split("-");
    return `${d}/${m}/${y}`;
  }
  return iso; // fallback
}

const onClickAbrirDocumento = async (documentoUrl) => {
  try {
    const response = await fetch(documentoUrl);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  } catch {
    showToast("error", "Erro", "Não foi possível abrir o documento.");
  }
};

// ---------------------------
// Carregar condomínios (select)
// ---------------------------
async function carregarCondominios() {
  try {
    const res = await fetch(uriCondominio);
    const dados = await res.json();

    // novo
    selectCondominio.innerHTML = `<option value="">Selecione o condomínio</option>`;
    // edição
    selectCondominioEdit.innerHTML = `<option value="">Selecione o condomínio</option>`;

    dados.forEach((cond) => {
      const opt1 = document.createElement("option");
      opt1.value = cond.condominioid;
      opt1.textContent = cond.nomecondominio;
      selectCondominio.appendChild(opt1);

      const opt2 = document.createElement("option");
      opt2.value = cond.condominioid;
      opt2.textContent = cond.nomecondominio;
      selectCondominioEdit.appendChild(opt2);
    });
  } catch (e) {
    console.error(e);
    showToast("error", "Erro", "Falha ao carregar lista de condomínios.");
  }
}

// ---------------------------
// Listar comunicados (cards)
// ---------------------------
function renderCards(lista) {
  cardsContainer.innerHTML = "";
  qtdLista.textContent = String(lista.length);

  if (!lista.length) {
    emptyState.classList.remove("d-none");
    return;
  }
  emptyState.classList.add("d-none");

  lista.forEach((c) => {
    const id = c.comunicadosid ?? c.id; // compat
    const descricao = c.descricao || "—";
    const data = c.datacomunicado || c.data || "—";
    const nomeCondominio = c.nomeCondominio || c.condominioNome || "—";
    const documentoUrl = c.documentoUrl || c.documento || null;
    const status = c.status || "OK";

    const col = document.createElement("div");
    col.className = "col-md-6 col-lg-4 mb-4";

    const docInfo = documentoUrl
      ? `<div class="mt-2"><strong>Documento:</strong> <span class="text-muted">Anexado</span></div>`
      : `<div class="mt-2"><strong>Documento:</strong> <span class="text-muted">Sem anexo</span></div>`;

    const btnAbrir = documentoUrl
      ? `<button class="btn btn-sm btn-primary paiva-btn-primary" data-abrir="${id}">
           <i class="fas fa-file-alt mr-1"></i> Abrir
         </button>`
      : `<button class="btn btn-sm btn-secondary" disabled>
           <i class="fas fa-file-alt mr-1"></i> Abrir
         </button>`;

    col.innerHTML = `
      <div class="card shadow-sm h-100 paiva-card-list">
        <div class="card-body">
          <div class="d-flex align-items-start justify-content-between">
            <div>
              <div class="paiva-card-kicker">${formatDateISOToBR(data)}</div>
              <h5 class="paiva-card-title">${descricao}</h5>
              <div class="paiva-card-sub">
                <i class="fas fa-building mr-1"></i> ${nomeCondominio}
              </div>
            </div>
            <div class="paiva-badge-ok">${status}</div>
          </div>

          ${docInfo}

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

    cardsContainer.appendChild(col);

    // listeners
    const btnOpen = col.querySelector(`[data-abrir="${id}"]`);
    btnOpen?.addEventListener("click", () => onClickAbrirDocumento(documentoUrl));

    col.querySelector(`[data-editar="${id}"]`)?.addEventListener("click", async () => {
      await abrirEdicaoPorId(id); // ✅ agora busca do backend pra evitar 404/obj desatualizado
    });

    col.querySelector(`[data-excluir="${id}"]`)?.addEventListener("click", () => {
      onClickExcluirDocumento(id);
    });
  });
}

async function listarComunicados() {
  try {
    const res = await fetch(uriComunicadosController);
    const dados = await res.json();

    comunicadosCache = Array.isArray(dados) ? dados : [];
    aplicarFiltro();
  } catch (e) {
    console.error(e);
    showToast("error", "Erro", "Falha ao carregar comunicados.");
  }
}

// ---------------------------
// Busca
// ---------------------------
function aplicarFiltro() {
  const q = (inputBusca.value || "").trim().toLowerCase();

  if (!q) {
    renderCards(comunicadosCache);
    return;
  }

  const filtrado = comunicadosCache.filter((c) => {
    const id = c.comunicadosid ?? c.id;
    const descricao = (c.descricao || "").toLowerCase();
    const nomeCondominio = (c.nomeCondominio || c.condominioNome || "").toLowerCase();
    const data = (c.datacomunicado || c.data || "").toLowerCase();

    return (
      String(id).includes(q) ||
      descricao.includes(q) ||
      nomeCondominio.includes(q) ||
      data.includes(q)
    );
  });

  renderCards(filtrado);
}

inputBusca.addEventListener("input", aplicarFiltro);

// ---------------------------
// CREATE (novo comunicado)
// ---------------------------
formComunicado.addEventListener("submit", async (e) => {
  e.preventDefault();

  const file = formComunicado.documento.files?.[0];
  if (!file) {
    showToast("error", "Erro", "Selecione um documento.");
    return;
  }

  const uploadResult = await cloudinaryUpload(file);
  if (uploadResult.error) {
    showToast("error", "Erro", "Erro ao fazer upload do documento!");
    return;
  }

  try {
    const res = await fetch(uriComunicadosController, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        datacomunicado: formComunicado.datacomunicado.value,
        descricao: formComunicado.descricao.value,
        CondominioID: selectCondominio.value,
        documentoUrl: uploadResult.data,
      }),
    });

    if (res.status === 201 || res.ok) {
      formComunicado.reset();
      fileHint.textContent = "Nenhum arquivo selecionado.";
      showToast("success", "Sucesso", "Comunicado cadastrado com sucesso!");
      await listarComunicados();
    } else {
      showToast("error", "Erro", "Erro ao cadastrar comunicado.");
    }
  } catch (e2) {
    console.error(e2);
    showToast("error", "Erro", "Falha ao cadastrar comunicado.");
  }
});

// ---------------------------
// DELETE
// ---------------------------
async function onClickExcluirDocumento(id) {
  const confirmar = confirm("Tem certeza que deseja excluir este comunicado?");
  if (!confirmar) return;

  try {
    const res = await fetch(`${uriComunicadosController}/${id}`, { method: "DELETE" });

    if (res.status === 200 || res.ok) {
      showToast("success", "Excluído", "Comunicado excluído com sucesso!");
      await listarComunicados();
    } else {
      showToast("error", "Erro", "Não foi possível excluir.");
    }
  } catch (e) {
    console.error(e);
    showToast("error", "Erro", "Falha ao excluir.");
  }
}

// ---------------------------
// EDIT (busca por id no back + abre modal)
// ---------------------------
async function abrirEdicaoPorId(id) {
  try {
    const res = await fetch(`${uriComunicadosController}/${id}`); // ✅ precisa existir no backend
    if (!res.ok) {
      showToast("error", "Erro", "Não foi possível carregar os dados para edição.");
      return;
    }
    const item = await res.json();
    abrirEdicao(item);
  } catch (e) {
    console.error(e);
    showToast("error", "Erro", "Falha ao carregar comunicado para edição.");
  }
}

function abrirEdicao(item) {
  const id = item.comunicadosid ?? item.id;

  formEditar.id.value = id;
  formEditar.documentoUrlAtual.value = item.documentoUrl || item.documento || "";
  formEditar.datacomunicado.value = item.datacomunicado || item.data || "";
  formEditar.descricao.value = item.descricao || "";

  // ✅ aqui era o bug: agora setamos no SELECT correto do modal
  const condId = item.CondominioID || item.condominioId || "";
  selectCondominioEdit.value = condId ? String(condId) : "";

  fileHintEdit.textContent = "Mantendo o documento atual.";
  openModal();
}

// ---------------------------
// UPDATE (salva modal)
// ---------------------------
formEditar.addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = formEditar.id.value;
  const file = formEditar.documento.files?.[0];

  let documentoUrlFinal = formEditar.documentoUrlAtual.value || "";

  // se selecionou novo arquivo, faz upload
  if (file) {
    const up = await cloudinaryUpload(file);
    if (up.error) {
      showToast("error", "Erro", "Erro ao fazer upload do novo documento!");
      return;
    }
    documentoUrlFinal = up.data;
  }

  try {
    const res = await fetch(`${uriComunicadosController}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        datacomunicado: formEditar.datacomunicado.value,
        descricao: formEditar.descricao.value,
        CondominioID: selectCondominioEdit.value, // ✅ select correto
        documentoUrl: documentoUrlFinal, // pode ser vazio -> back mantém atual se você fez daquele jeito
      }),
    });

    if (res.status === 200 || res.ok) {
      closeModal();
      showToast("success", "Atualizado", "Comunicado atualizado com sucesso!");
      await listarComunicados();
    } else {
      showToast("error", "Erro", "Não foi possível salvar. Verifique PUT/validações do backend.");
    }
  } catch (err) {
    console.error(err);
    showToast("error", "Erro", "Falha ao salvar edição.");
  }
});

// ---------------------------
// Init
// ---------------------------
document.addEventListener("DOMContentLoaded", async () => {
  await carregarCondominios();
  await listarComunicados();
});
