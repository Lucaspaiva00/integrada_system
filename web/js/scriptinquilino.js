const caixaForms = document.querySelector("#caixaForms");
const uri = "https://integrada-api.onrender.com/inquilinoscontroller";
const uriCondominio = "https://integrada-api.onrender.com/condominiocontroller";
const uriClientes = "https://integrada-api.onrender.com/clientescontroller";
const cardsContainer = document.querySelector("#cardsContainer");

// Carregar condomínios
fetch(uriCondominio)
  .then((res) => res.json())
  .then((condominios) => {
    const selectCondominio = document.querySelector("#CondominioID");
    condominios.forEach((c) => {
      const option = document.createElement("option");
      option.value = c.condominioid;
      option.textContent = c.nomecondominio;
      selectCondominio.appendChild(option);
    });
  })
  .catch((err) => console.error("Erro ao carregar condomínios:", err));

// Carregar proprietários
fetch(uriClientes)
  .then((res) => res.json())
  .then((clientes) => {
    const selectCliente = document.querySelector("#ClienteID");
    clientes.forEach((c) => {
      const option = document.createElement("option");
      option.value = c.clienteid;
      option.textContent = `${c.nome} (Ap: ${c.apartamento})`;
      selectCliente.appendChild(option);
    });
  })
  .catch((err) => console.error("Erro ao carregar proprietários:", err));

// Cadastrar inquilino
caixaForms.addEventListener("submit", (e) => {
  e.preventDefault();

  const data = {
    apartamento: caixaForms.apartamento.value.trim(),
    nome: caixaForms.nome.value.trim(),
    cpf: caixaForms.cpf.value.trim(),
    telefone: caixaForms.telefone.value.trim(),
    email: caixaForms.email.value.trim(),
    CondominioID: Number(caixaForms.CondominioID.value),
    ClienteID: Number(caixaForms.ClienteID.value),
  };

  fetch(uri, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
    .then((res) => res.status)
    .then((status) => {
      if (status === 201) {
        alert("✅ Inquilino cadastrado com sucesso!");
        caixaForms.reset();
        carregarInquilinos();
      } else {
        alert("❌ Erro ao cadastrar inquilino.");
      }
    })
    .catch((err) => console.error("Erro ao cadastrar inquilino:", err));
});

function carregarInquilinos() {
  fetch(uri)
    .then((res) => res.json())
    .then((dados) => {
      const tbody = document.querySelector("#tbodyInquilinos");
      tbody.innerHTML = "";

      if (!dados.length) {
        tbody.innerHTML = `
          <tr><td colspan="6" class="text-center text-muted">Nenhum inquilino cadastrado.</td></tr>
        `;
        return;
      }

      dados.forEach((i) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${i.nome}</td>
          <td>${i.cpf}</td>
          <td>${i.telefone}</td>
          <td>${i.email}</td>
          <td>${i.condominio}</td>
          <td>${i.proprietario}</td>
        `;
        tbody.appendChild(tr);
      });
    })
    .catch((err) => console.error("Erro ao carregar inquilinos:", err));
}

document.addEventListener("DOMContentLoaded", carregarInquilinos);
