const caixaForms = document.querySelector("#caixaForms");
const uri = "http://localhost:3000/clientescontroller";
const uriCondominio = "http://localhost:3000/condominiocontroller";
const cardsContainer = document.querySelector("#cardsContainer");

// 🏢 Preenche o select de condomínios dinamicamente
fetch(uriCondominio)
  .then(res => res.json())
  .then(condominios => {
    const select = document.querySelector("#CondominioID");
    condominios.forEach(c => {
      const option = document.createElement("option");
      option.value = c.condominioid;
      option.textContent = c.nomecondominio;
      select.appendChild(option);
    });
  })
  .catch(err => console.error("Erro ao carregar condomínios:", err));

// 🧾 Cadastra novo proprietário
caixaForms.addEventListener("submit", e => {
  e.preventDefault();

  const data = {
    apartamento: caixaForms.apartamento.value,
    nome: caixaForms.nome.value,
    cpf: caixaForms.cpf.value,
    telefone: caixaForms.telefone.value,
    email: caixaForms.email.value,
    CondominioID: Number(caixaForms.CondominioID.value)
  };

  fetch(uri, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  })
    .then(res => {
      if (res.status === 201) {
        alert("✅ Proprietário cadastrado com sucesso!");
        caixaForms.reset();
        carregarCondominos();
      } else {
        alert("❌ Erro ao cadastrar o proprietário");
      }
    })
    .catch(err => {
      console.error("Erro ao cadastrar proprietário:", err);
      alert("Erro no servidor ao cadastrar");
    });
});

// 📋 Lista todos os proprietários
function carregarCondominos() {
  fetch(uri)
    .then(res => res.json())
    .then(dados => {
      cardsContainer.innerHTML = "";

      if (dados.length === 0) {
        cardsContainer.innerHTML = "<p class='text-muted'>Nenhum proprietário cadastrado.</p>";
        return;
      }

      dados.forEach(cliente => {
        const card = document.createElement("div");
        card.classList.add("col-md-4", "mb-4");

        card.innerHTML = `
          <div class="card shadow-sm border-left-success h-100">
            <div class="card-body">
              <h5 class="card-title text-dark">${cliente.nome}</h5>
              <p class="card-text"><strong>Apartamento:</strong> ${cliente.apartamento}</p>
              <p class="card-text"><strong>CPF:</strong> ${cliente.cpf}</p>
              <p class="card-text"><strong>Telefone:</strong> ${cliente.telefone}</p>
              <p class="card-text"><strong>Email:</strong> ${cliente.email}</p>
              <p class="card-text"><strong>Condomínio:</strong> ${cliente.Condominio?.nomecondominio || "Não definido"}</p>
              
            </div>
          </div>
        `;

        cardsContainer.appendChild(card);
      });
    })
    .catch(err => console.error("Erro ao carregar condôminos:", err));
}

document.addEventListener("DOMContentLoaded", carregarCondominos);

