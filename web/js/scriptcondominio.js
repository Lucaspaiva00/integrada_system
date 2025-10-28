const caixaForms = document.querySelector("#caixaForms");
const uri = "https://integrada-api.onrender.com/condominiocontroller";
const tabela = document.querySelector("#cliente");

let editando = false;
let idEditando = null;

// 🧾 Cadastrar ou atualizar condomínio
caixaForms.addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = {
    nomecondominio: caixaForms.nomecondominio.value,
    endereco: caixaForms.endereco.value,
    telefone: caixaForms.telefone.value,
  };

  if (!editando) {
    // Criar novo
    const res = await fetch(uri, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.status === 201) {
      alert("✅ Condomínio cadastrado com sucesso!");
      window.location.reload();
    } else {
      alert("❌ Erro ao cadastrar condomínio.");
    }
  } else {
    // Atualizar existente
    const res = await fetch(`${uri}/${idEditando}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.status === 200) {
      alert("✅ Condomínio atualizado com sucesso!");
      window.location.reload();
    } else {
      alert("❌ Erro ao atualizar condomínio.");
    }
  }
});

// 📋 Listar condomínios
async function listarCondominios() {
  const res = await fetch(uri);
  const dados = await res.json();

  tabela.innerHTML = "";

  if (!dados.length) {
    tabela.innerHTML = `<tr><td colspan="4" class="text-center">Nenhum condomínio cadastrado.</td></tr>`;
    return;
  }

  dados.forEach((e) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${e.nomecondominio}</td>
      <td>${e.endereco}</td>
      <td>${e.telefone}</td>
      <td>
        <button class="btn btn-sm btn-primary" onclick="editarCondominio(${e.condominioid})">
          ✏️ Editar
        </button>
      </td>
    `;

    tabela.appendChild(tr);
  });
}

// ✏️ Função para editar
async function editarCondominio(id) {
  const res = await fetch(uri);
  const dados = await res.json();
  const cond = dados.find((c) => c.condominioid === id);

  if (!cond) return alert("Condomínio não encontrado.");

  caixaForms.nomecondominio.value = cond.nomecondominio;
  caixaForms.endereco.value = cond.endereco;
  caixaForms.telefone.value = cond.telefone;

  editando = true;
  idEditando = id;

  const botao = caixaForms.querySelector("button[type='submit']");
  botao.textContent = "Salvar Alterações";
  botao.classList.remove("btn-success");
  botao.classList.add("btn-warning");
}

listarCondominios();
