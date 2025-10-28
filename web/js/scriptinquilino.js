const caixaForms = document.querySelector("#caixaForms");
const uri = "https://integrada-api.onrender.com/inquilinoscontroller";
const uriCondominio = "https://integrada-api.onrender.com/condominiocontroller";
const uriClientes = "https://integrada-api.onrender.com/clientescontroller";

const tbody = document.querySelector("#tbodyInquilinos");

let editando = false;
let idEditando = null;

// --------------------------------------------------
// Carrega select de condomínios
// --------------------------------------------------
async function carregarCondominios() {
  try {
    const res = await fetch(uriCondominio);
    const condominios = await res.json();

    const selectCondominio = caixaForms.querySelector("#CondominioID");
    selectCondominio.innerHTML = `<option value="">Selecione o condomínio</option>`;

    condominios.forEach((c) => {
      const option = document.createElement("option");
      option.value = c.condominioid;
      option.textContent = c.nomecondominio;
      selectCondominio.appendChild(option);
    });
  } catch (err) {
    console.error("Erro ao carregar condomínios:", err);
  }
}

// --------------------------------------------------
// Carrega select de proprietários
// --------------------------------------------------
async function carregarClientes() {
  try {
    const res = await fetch(uriClientes);
    const clientes = await res.json();

    const selectCliente = caixaForms.querySelector("#ClienteID");
    selectCliente.innerHTML = `<option value="">Selecione o proprietário</option>`;

    clientes.forEach((c) => {
      const option = document.createElement("option");
      option.value = c.clienteid;
      option.textContent = `${c.nome} (Ap: ${c.apartamento})`;
      selectCliente.appendChild(option);
    });
  } catch (err) {
    console.error("Erro ao carregar proprietários:", err);
  }
}

// --------------------------------------------------
// Salvar (cadastrar novo OU atualizar existente)
// --------------------------------------------------
caixaForms.addEventListener("submit", async (e) => {
  e.preventDefault();

  const payload = {
    apartamento: caixaForms.apartamento.value.trim(),
    nome: caixaForms.nome.value.trim(),
    cpf: caixaForms.cpf.value.trim(),
    telefone: caixaForms.telefone.value.trim(),
    email: caixaForms.email.value.trim(),
    CondominioID: Number(caixaForms.CondominioID.value),
    ClienteID: Number(caixaForms.ClienteID.value),
  };

  // se estamos editando -> PUT
  if (editando && idEditando) {
    const res = await fetch(`${uri}/${idEditando}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.status === 200) {
      alert("✅ Inquilino atualizado com sucesso!");
      resetarFormulario();
      carregarInquilinos();
    } else {
      alert("❌ Erro ao atualizar inquilino.");
    }

    return;
  }

  // se estamos criando -> POST
  const res = await fetch(uri, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (res.status === 201) {
    alert("✅ Inquilino cadastrado com sucesso!");
    resetarFormulario();
    carregarInquilinos();
  } else {
    alert("❌ Erro ao cadastrar inquilino.");
  }
});

// --------------------------------------------------
// Carrega e desenha a lista na tabela
// --------------------------------------------------
async function carregarInquilinos() {
  try {
    const res = await fetch(uri);
    const dados = await res.json();

    tbody.innerHTML = "";

    if (!dados.length) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" class="text-center text-muted">
            Nenhum inquilino cadastrado.
          </td>
        </tr>`;
      return;
    }

    dados.forEach((i) => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${i.nome}</td>
        <td>${i.apartamento || "-"}</td>
        <td>${i.cpf || "-"}</td>
        <td>${i.telefone || "-"}</td>
        <td>${i.email || "-"}</td>
        <td>${i.condominioNome || "-"}</td>
        <td>${i.proprietarioNome || "-"}</td>
        <td>
          <button class="btn btn-sm btn-primary" data-edit="${i.id}">
            ✏️ Editar
          </button>
        </td>
      `;

      tbody.appendChild(tr);
    });

    // liga os botões "Editar"
    tbody.querySelectorAll("[data-edit]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = Number(btn.getAttribute("data-edit"));
        const inq = dados.find((x) => x.id === id);
        if (inq) preencherFormularioEdicao(inq);
      });
    });
  } catch (err) {
    console.error("Erro ao carregar inquilinos:", err);
  }
}

// --------------------------------------------------
// Preenche o formulário para edição
// --------------------------------------------------
function preencherFormularioEdicao(inq) {
  editando = true;
  idEditando = inq.id;

  caixaForms.nome.value = inq.nome || "";
  caixaForms.apartamento.value = inq.apartamento || "";
  caixaForms.cpf.value = inq.cpf || "";
  caixaForms.telefone.value = inq.telefone || "";
  caixaForms.email.value = inq.email || "";

  // seta condomínio e proprietário atuais no <select>
  caixaForms.CondominioID.value = inq.condominioId || "";
  caixaForms.ClienteID.value = inq.proprietarioId || "";

  // muda visual do botão principal
  const botao = caixaForms.querySelector("button[type='submit']");
  botao.textContent = "Salvar Alterações";
  botao.classList.remove("btn-success");
  botao.classList.add("btn-warning");

  // (opcional) dá um scroll pro topo pra garantir que ela veja o form
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// --------------------------------------------------
// Volta o formulário para modo "cadastrar"
// --------------------------------------------------
function resetarFormulario() {
  editando = false;
  idEditando = null;
  caixaForms.reset();

  const botao = caixaForms.querySelector("button[type='submit']");
  botao.textContent = "Cadastrar Inquilino";
  botao.classList.remove("btn-warning");
  botao.classList.add("btn-success");
}

// --------------------------------------------------
// Inicialização
// --------------------------------------------------
document.addEventListener("DOMContentLoaded", async () => {
  await carregarCondominios();
  await carregarClientes();
  await carregarInquilinos();
});
