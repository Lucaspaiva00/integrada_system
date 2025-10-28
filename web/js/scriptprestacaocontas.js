const caixaForms = document.querySelector("#caixaForms");
const selectCondominio = document.querySelector("#condominioSelect");
const uri = "https://integrada-api.onrender.com/prestacaocontascontroller";
const tabela = document.querySelector("#prestacao");

// 1️⃣ Carregar os condomínios no <select>
fetch("https://integrada-api.onrender.com/condominiocontroller")
  .then((res) => res.json())
  .then((lista) => {
    selectCondominio.innerHTML = `<option value="">Selecione o condomínio</option>`;
    lista.forEach((c) => {
      selectCondominio.innerHTML += `
        <option value="${c.condominioid}">
          ${c.nomecondominio}
        </option>`;
    });
  })
  .catch((err) => {
    console.error("Erro ao carregar condomínios:", err);
    alert("Erro ao carregar a lista de condomínios.");
  });

// 2️⃣ Enviar o formulário (cadastrar prestação)
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
    alert("✅ Prestação cadastrada com sucesso!");
    window.location.reload();
  } else {
    alert("❌ Erro ao cadastrar a prestação de contas!");
  }
});

// 3️⃣ Listar todas as prestações para a tabela
fetch(uri)
  .then((res) => res.json())
  .then((lista) => {
    tabela.innerHTML = "";

    if (!lista.length) {
      tabela.innerHTML = `
        <tr>
          <td colspan="3" class="text-center text-muted">
            Nenhuma prestação cadastrada ainda.
          </td>
        </tr>`;
      return;
    }

    lista.forEach((e) => {
      const mesFormatado = new Date(e.mes).toLocaleDateString("pt-BR", {
        month: "long",
        year: "numeric",
      });

      const linkDocumento = e.documentoUrl
        ? `<a href="${e.documentoUrl}" target="_blank" class="btn btn-sm btn-primary">
             📄 Abrir PDF
           </a>`
        : `<span class="text-muted">Sem documento</span>`;

      tabela.innerHTML += `
        <tr>
          <td>${e.nomeCondominio || "—"}</td>
          <td style="text-transform: capitalize;">${mesFormatado}</td>
          <td>${linkDocumento}</td>
        </tr>
      `;
    });
  })
  .catch((err) => {
    console.error("Erro ao carregar prestações:", err);
    tabela.innerHTML = `
      <tr>
        <td colspan="3" class="text-center text-danger">
          Erro ao carregar prestações.
        </td>
      </tr>`;
  });
