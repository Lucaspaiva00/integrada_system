const caixaForms = document.querySelector("#caixaForms");
const uri = "http://localhost:3000/inquilinoscontroller";
const uriCondominio = "http://localhost:3000/condominiocontroller";
const uriClientes = "http://localhost:3000/clientescontroller";

// 🏢 Preencher o select de condomínios
fetch(uriCondominio)
  .then(res => res.json())
  .then(condominios => {
    const selectCondominio = document.querySelector("#CondominioID");
    selectCondominio.innerHTML = `<option value="">Selecione o condomínio</option>`;

    condominios.forEach(c => {
      const option = document.createElement("option");
      option.value = c.condominioid;
      option.textContent = c.nomecondominio;
      selectCondominio.appendChild(option);
    });
  })
  .catch(err => console.error("Erro ao carregar condomínios:", err));

// 👨‍💼 Preencher o select de proprietários
fetch(uriClientes)
  .then(res => res.json())
  .then(clientes => {
    const selectCliente = document.querySelector("#ClienteID");
    selectCliente.innerHTML = `<option value="">Selecione o proprietário</option>`;

    clientes.forEach(cliente => {
      const option = document.createElement("option");
      option.value = cliente.clienteid;
      option.textContent = `${cliente.nome} - (Ap: ${cliente.apartamento})`;
      selectCliente.appendChild(option);
    });
  })
  .catch(err => console.error("Erro ao carregar proprietários:", err));

// 🧾 Cadastrar inquilino
caixaForms.addEventListener("submit", (e) => {
  e.preventDefault();

  const data = {
    apartamento: caixaForms.apartamento.value,
    nome: caixaForms.nome.value,
    cpf: caixaForms.cpf.value,
    telefone: caixaForms.telefone.value,
    email: caixaForms.email.value,
    CondominioID: Number(caixaForms.CondominioID.value),
    ClienteID: Number(caixaForms.ClienteID.value)
  };

  fetch(uri, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  })
    .then(res => res.status)
    .then(status => {
      if (status === 201) {
        alert("✅ Inquilino cadastrado com sucesso!");
        caixaForms.reset();
      } else {
        alert("❌ Erro ao cadastrar inquilino");
      }
    })
    .catch(err => console.error("Erro ao cadastrar inquilino:", err));
});
