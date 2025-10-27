const caixaForms = document.querySelector("#caixaForms");
const selectCondominio = document.querySelector("#condominioSelect");
const tbodyAssembleia = document.querySelector("#assembleia");

const uriCondominios =
  "https://integrada-api.onrender.com/condominiocontroller";
const uriAssembleias =
  "https://integrada-api.onrender.com/assembleiascontroller";

// 🏢 Carrega os condomínios no select
async function carregarCondominios() {
  try {
    const res = await fetch(uriCondominios);
    const dados = await res.json();

    selectCondominio.innerHTML = `<option value="">Selecione o condomínio</option>`;

    dados.forEach((cond) => {
      const option = document.createElement("option");
      option.value = cond.condominioid;
      option.textContent = cond.nomecondominio;
      selectCondominio.appendChild(option);
    });
  } catch (error) {
    console.error("Erro ao carregar condomínios:", error);
    alert("Erro ao carregar lista de condomínios.");
  }
}

// 📋 Lista as assembleias existentes
async function listarAssembleias() {
  try {
    const res = await fetch(uriAssembleias);
    const dados = await res.json();

    tbodyAssembleia.innerHTML = "";

    if (!dados.length) {
      tbodyAssembleia.innerHTML = `<tr><td colspan="3" class="text-center text-muted">Nenhuma assembleia cadastrada.</td></tr>`;
      return;
    }

    dados.forEach((item) => {
      const tr = document.createElement("tr");
      const linkDocumento = item.documento
        ? `<a href="https://integrada-api.onrender.com/documentos/assembleia/${item.documento}" target="_blank" class="btn btn-sm btn-primary">📄 Ver Documento</a>`
        : "—";

      tr.innerHTML = `
        <td>${item.descricao}</td>
        <td>${item.Condominio?.nomecondominio || "—"}</td>
        <td>${linkDocumento}</td>
      `;

      tbodyAssembleia.appendChild(tr);
    });
  } catch (error) {
    console.error("Erro ao listar assembleias:", error);
    alert("Erro ao carregar assembleias.");
  }
}

// 📤 Enviar formulário com arquivo
caixaForms.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData();
  formData.append("descricao", caixaForms.descricao.value);
  formData.append("CondominioID", selectCondominio.value);
  formData.append("documento", caixaForms.documento.files[0]);

  try {
    const res = await fetch(uriAssembleias, {
      method: "POST",
      body: formData,
    });

    if (res.status === 201) {
      alert("✅ Assembleia cadastrada com sucesso!");
      caixaForms.reset();
      listarAssembleias();
    } else {
      alert("❌ Erro ao cadastrar assembleia!");
    }
  } catch (error) {
    console.error("Erro ao enviar assembleia:", error);
    alert("Falha ao enviar assembleia.");
  }
});

// 🚀 Inicializa tudo
carregarCondominios();
listarAssembleias();
