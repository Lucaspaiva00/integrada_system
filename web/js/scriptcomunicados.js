const caixaForms = document.querySelector("#caixaForms");
const uri = "https://integrada-api.onrender.com/comunicadoscontroller";
const uriCondominio = "https://integrada-api.onrender.com/condominiocontroller";
const tbody = document.querySelector("#comunicado");
const selectCondominio = document.querySelector("#CondominioID");

// 🏢 Carregar condomínios no select
async function carregarCondominios() {
  const res = await fetch(uriCondominio);
  const dados = await res.json();

  selectCondominio.innerHTML = `<option value="">Selecione o condomínio</option>`;

  dados.forEach((cond) => {
    const option = document.createElement("option");
    option.value = cond.condominioid;
    option.textContent = cond.nomecondominio;
    selectCondominio.appendChild(option);
  });
}

// 🧾 Cadastrar comunicado com arquivo
caixaForms.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData();
  formData.append("datacomunicado", caixaForms.datacomunicado.value);
  formData.append("descricao", caixaForms.descricao.value);
  formData.append("CondominioID", selectCondominio.value);
  formData.append("documento", caixaForms.documento.files[0]);

  const res = await fetch(uri, {
    method: "POST",
    body: formData,
  });

  if (res.status === 201) {
    alert("✅ Comunicado cadastrado com sucesso!");
    caixaForms.reset();
    listarComunicados();
  } else {
    alert("❌ Erro ao cadastrar comunicado.");
  }
});

// 📋 Listar comunicados na tabela
async function listarComunicados() {
  const res = await fetch(uri);
  const dados = await res.json();

  tbody.innerHTML = "";

  if (!dados.length) {
    tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted">Nenhum comunicado cadastrado.</td></tr>`;
    return;
  }

  dados.forEach((c) => {
    const tr = document.createElement("tr");

    // usa documentoUrl bonito se quiser botão, ou mantém como estava
    const linkDocumento = c.documento
      ? `<a href="${c.documentoUrl || `https://integrada-api.onrender.com/documentos/comunicados/${encodeURIComponent(
          c.documento
        )}`}" target="_blank" class="btn btn-sm btn-primary">📄 Ver Documento</a>`
      : "—";

    tr.innerHTML = `
      <td>${c.datacomunicado}</td>
      <td>${c.descricao}</td>
      <td>${c.nomeCondominio || "—"}</td>
      <td>${linkDocumento}</td>
    `;

    tbody.appendChild(tr);
  });
}

// 🚀 Inicialização
carregarCondominios();
listarComunicados();


// const caixaForms = document.querySelector("#caixaForms");
// const uri = "https://integrada-api.onrender.com/comunicadoscontroller";
// const uriCondominio = "https://integrada-api.onrender.com/condominiocontroller";
// const tbody = document.querySelector("#comunicado");
// const selectCondominio = document.querySelector("#CondominioID");

// // 🏢 Carregar condomínios no select
// async function carregarCondominios() {
//   const res = await fetch(uriCondominio);
//   const dados = await res.json();

//   selectCondominio.innerHTML = `<option value="">Selecione o condomínio</option>`;

//   dados.forEach((cond) => {
//     const option = document.createElement("option");
//     option.value = cond.condominioid;
//     option.textContent = cond.nomecondominio;
//     selectCondominio.appendChild(option);
//   });
// }

// // 🧾 Cadastrar comunicado com arquivo
// caixaForms.addEventListener("submit", async (e) => {
//   e.preventDefault();

//   const formData = new FormData();
//   formData.append("datacomunicado", caixaForms.datacomunicado.value);
//   formData.append("descricao", caixaForms.descricao.value);
//   formData.append("CondominioID", selectCondominio.value);
//   formData.append("documento", caixaForms.documento.files[0]);

//   const res = await fetch(uri, {
//     method: "POST",
//     body: formData,
//   });

//   if (res.status === 201) {
//     alert("✅ Comunicado cadastrado com sucesso!");
//     caixaForms.reset();
//     listarComunicados();
//   } else {
//     alert("❌ Erro ao cadastrar comunicado.");
//   }
// });

// // 📋 Listar comunicados na tabela
// async function listarComunicados() {
//   const res = await fetch(uri);
//   const dados = await res.json();

//   tbody.innerHTML = "";

//   if (!dados.length) {
//     tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted">Nenhum comunicado cadastrado.</td></tr>`;
//     return;
//   }

//   dados.forEach((c) => {
//     const tr = document.createElement("tr");
//     const linkDocumento = c.documento
//       ? `<a href="https://integrada-api.onrender.com/documentos/comunicados/${c.documento}" target="_blank" class="btn btn-sm btn-primary">📄 Ver Documento</a>`
//       : "—";

//     tr.innerHTML = `
//       <td>${c.datacomunicado}</td>
//       <td>${c.descricao}</td>
//       <td>${c.Condominio?.nomecondominio || "—"}</td>
//       <td>${linkDocumento}</td>
//     `;

//     tbody.appendChild(tr);
//   });
// }

// // 🚀 Inicialização
// carregarCondominios();
// listarComunicados();
