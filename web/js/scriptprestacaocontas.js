const caixaForms = document.querySelector("#caixaForms");
const selectCondominio = document.querySelector("#condominioSelect");
const uri = "https://integrada-api.onrender.com/prestacaocontascontroller";
const tabela = document.querySelector("#prestacao");

// 1️⃣ Carregar os condomínios
fetch("https://integrada-api.onrender.com/condominiocontroller")
  .then((res) => res.json())
  .then((lista) => {
    lista.forEach((c) => {
      selectCondominio.innerHTML += `<option value="${c.condominioid}">${c.nomecondominio}</option>`;
    });
  });

// 2️⃣ Enviar o formulário
caixaForms.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData();
  formData.append("documento", caixaForms.documento.files[0]);
  formData.append("mes", caixaForms.mes.value);
  formData.append("CondominioID", selectCondominio.value);

  const res = await fetch(uri, {
    method: "POST",
    body: formData,
  });

  if (res.status === 201) {
    alert("Prestação cadastrada com sucesso!");
    window.location.reload();
  } else {
    alert("Erro ao cadastrar a prestação de contas!");
  }
});

// 3️⃣ Listar todas as prestações
fetch(uri)
  .then((res) => res.json())
  .then((lista) => {
    lista.forEach((e) => {
      tabela.innerHTML += `
        <tr>
          <td>${e.Condominio?.nomecondominio}</td>
          <td>${new Date(e.mes).toLocaleDateString()}</td>
          <td><a href="https://integrada-api.onrender.com/files/prestacoes/${
            e.documento
          }" target="_blank">Abrir PDF</a></td>
        </tr>
      `;
    });
  });
