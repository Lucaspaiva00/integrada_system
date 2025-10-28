const caixaForms = document.querySelector("#caixaForms");
const uri = "https://integrada-api.onrender.com/clientescontroller";
const uriCondominio = "https://integrada-api.onrender.com/condominiocontroller";
const cardsContainer = document.querySelector("#cardsContainer");

let editando = false;
let idEditando = null;

// 🔹 Carrega condomínios
async function carregarCondominios() {
  try {
    const res = await fetch(uriCondominio);
    const condominios = await res.json();
    const select = document.querySelector("#CondominioID");

    select.innerHTML = `<option value="">Selecione o Condomínio</option>`;
    condominios.forEach((c) => {
      const option = document.createElement("option");
      option.value = c.condominioid;
      option.textContent = c.nomecondominio;
      select.appendChild(option);
    });
  } catch (err) {
    console.error("Erro ao carregar condomínios:", err);
  }
}

// 🔹 Cadastrar ou atualizar proprietário
caixaForms.addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = {
    apartamento: caixaForms.apartamento.value.trim(),
    nome: caixaForms.nome.value.trim(),
    cpf: caixaForms.cpf.value.trim(),
    telefone: caixaForms.telefone.value.trim(),
    email: caixaForms.email.value.trim(),
    CondominioID: Number(caixaForms.CondominioID.value),
  };

  if (editando && idEditando) {
    // PUT
    const res = await fetch(`${uri}/${idEditando}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (res.status === 200) {
      alert("✅ Proprietário atualizado com sucesso!");
      resetarFormulario();
      carregarCondominos();
    } else {
      alert("❌ Erro ao atualizar o proprietário.");
    }
    return;
  }

  // POST
  const res = await fetch(uri, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (res.status === 201) {
    alert("✅ Proprietário cadastrado com sucesso!");
    resetarFormulario();
    carregarCondominos();
  } else {
    alert("❌ Erro ao cadastrar o proprietário.");
  }
});

// 🔹 Carrega todos os proprietários
async function carregarCondominos() {
  try {
    const res = await fetch(uri);
    const dados = await res.json();
    cardsContainer.innerHTML = "";

    if (!dados.length) {
      cardsContainer.innerHTML =
        "<p class='text-muted'>Nenhum proprietário cadastrado.</p>";
      return;
    }

    dados.forEach((cliente) => {
      const card = document.createElement("div");
      card.classList.add("col-md-4", "mb-4");

      card.innerHTML = `
        <div class="card shadow-sm border-left-success h-100">
          <div class="card-body">
            <h5 class="card-title text-dark">${cliente.nome}</h5>
            <p><strong>Apartamento:</strong> ${cliente.apartamento}</p>
            <p><strong>CPF:</strong> ${cliente.cpf}</p>
            <p><strong>Telefone:</strong> ${cliente.telefone}</p>
            <p><strong>Email:</strong> ${cliente.email}</p>
            <p><strong>Condomínio:</strong> ${
              cliente.Condominio?.nomecondominio || "Não definido"
            }</p>
            <button class="btn btn-primary btn-sm mt-2" data-edit="${
              cliente.clienteid
            }">✏️ Editar</button>
          </div>
        </div>
      `;

      cardsContainer.appendChild(card);
    });

    // ativa botões de edição
    cardsContainer.querySelectorAll("[data-edit]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = Number(btn.getAttribute("data-edit"));
        const cliente = dados.find((c) => c.clienteid === id);
        if (cliente) preencherFormulario(cliente);
      });
    });
  } catch (err) {
    console.error("Erro ao carregar proprietários:", err);
  }
}

// 🔹 Preenche o formulário para edição
function preencherFormulario(cliente) {
  editando = true;
  idEditando = cliente.clienteid;

  caixaForms.apartamento.value = cliente.apartamento || "";
  caixaForms.nome.value = cliente.nome || "";
  caixaForms.cpf.value = cliente.cpf || "";
  caixaForms.telefone.value = cliente.telefone || "";
  caixaForms.email.value = cliente.email || "";
  caixaForms.CondominioID.value = cliente.CondominioID || "";

  const botao = caixaForms.querySelector("button[type='submit']");
  botao.textContent = "Salvar Alterações";
  botao.classList.remove("btn-success");
  botao.classList.add("btn-warning");

  window.scrollTo({ top: 0, behavior: "smooth" });
}

// 🔹 Reseta formulário
function resetarFormulario() {
  editando = false;
  idEditando = null;
  caixaForms.reset();

  const botao = caixaForms.querySelector("button[type='submit']");
  botao.textContent = "Cadastrar Proprietário";
  botao.classList.remove("btn-warning");
  botao.classList.add("btn-success");
}

// 🚀 Inicialização
document.addEventListener("DOMContentLoaded", async () => {
  await carregarCondominios();
  await carregarCondominos();
});
