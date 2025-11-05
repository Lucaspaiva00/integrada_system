const caixaForms = document.querySelector("#caixaForms");
const uri = "https://integrada-api.onrender.com/comunicadoscontroller";
const uriDev = "http://localhost:3000/comunicadoscontroller";
const uriCondominio = "https://integrada-api.onrender.com/condominiocontroller";
const tbody = document.querySelector("#comunicado");
const selectCondominio = document.querySelector("#CondominioID");

const onClickAbrirDocumento = async (documentoUrl) => {
  const response = await fetch(documentoUrl);
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank");
};
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
const cloudinaryUpload = async (file) => {
  const CLOUDINARY_API_KEY = "839478495457115";
  const CLOUDINARY_API_SECRET = "H00NjZ74G8NAOGL-MxhCAaVge9g";
  try {
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", "integrada");
    data.append("cloud_name", "dfdinbti3");
    data.append("folder", "integrada");
    data.append("api_key", CLOUDINARY_API_KEY);
    data.append("api_secret", CLOUDINARY_API_SECRET);

    // const res = await api().post<{
    //   secure_url: string;
    // }>(`https://api.cloudinary.com/v1_1/dicogrlex/image/upload`, data);
    // console.log(res);

    const res = await fetch(
      "https://api.cloudinary.com/v1_1/integrada/image/upload",
      {
        method: "POST",
        body: data,
      }
    ).then((res) => res.json());

    if (res.error) {
      throw new Error(res.error.message);
    }
    console.log(res);

    return { data: res.secure_url, error: null };
  } catch (error) {
    console.log(error);

    return { data: null, error: "erro ao fazer upload" };
  }
};

// 🧾 Cadastrar comunicado com arquivo
caixaForms.addEventListener("submit", async (e) => {
  e.preventDefault();

  const uploadResult = await cloudinaryUpload(caixaForms.documento.files[0]);

  if (uploadResult.error) {
    alert("❌ Erro ao fazer upload do documento!");
    return;
  }

  const res = await fetch(uriDev, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      datacomunicado: caixaForms.datacomunicado.value,
      descricao: caixaForms.descricao.value,
      CondominioID: selectCondominio.value,
      documentoUrl: uploadResult.data,
    }),
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
  const res = await fetch(uriDev);
  const dados = await res.json();

  tbody.innerHTML = "";

  if (!dados.length) {
    tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted">Nenhum comunicado cadastrado.</td></tr>`;
    return;
  }

  dados.forEach((c) => {
    const tr = document.createElement("tr");

    // usa documentoUrl bonito se quiser botão, ou mantém como estava
    const linkDocumento = c.documentoUrl
      ? `<button onclick=onClickAbrirDocumento("${c.documentoUrl}") class="btn btn-sm btn-primary"> 📄 Abrir PDF </button>`
      : `<span class="text-muted">Sem documento</span>`;

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
