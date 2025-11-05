const caixaForms = document.querySelector("#caixaForms");
const selectCondominio = document.querySelector("#condominioSelect");
const uri = "https://integrada-api.onrender.com/prestacaocontascontroller";
const uriDev = "http://localhost:3000/prestacaocontascontroller";
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

// 2️⃣ Enviar o formulário (cadastrar prestação)
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
      documentoUrl: uploadResult.data,
      mes: caixaForms.mes.value,
      CondominioID: selectCondominio.value,
    }),
  });

  if (res.status === 201) {
    alert("✅ Prestação cadastrada com sucesso!");
    // window.location.reload();
  } else {
    alert("❌ Erro ao cadastrar a prestação de contas!");
  }
});
const onClickAbrirDocumento = async (documentoUrl) => {
  const response = await fetch(documentoUrl);
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank");
};
// 3️⃣ Listar todas as prestações para a tabela
fetch(uriDev)
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

    lista.forEach(async (e) => {
      const mesFormatado = new Date(e.mes).toLocaleDateString("pt-BR", {
        month: "long",
        year: "numeric",
      });

      const linkDocumento = e.documentoUrl
        ? `<button onclick=onClickAbrirDocumento("${e.documentoUrl}") class="btn btn-sm btn-primary"> 📄 Abrir PDF </button>`
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
