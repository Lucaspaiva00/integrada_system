const caixaForms = document.querySelector("#caixaForms");
const selectCondominio = document.querySelector("#condominioSelect");
const tbodyAssembleia = document.querySelector("#assembleia");

const uriCondominios =
  "https://integrada-api.onrender.com/condominiocontroller";
const uriAssembleias =
  "https://integrada-api.onrender.com/assembleiascontroller";
const uriDevAssembleias = "http://localhost:3000/assembleiascontroller";

const onClickExcluirDocumento = async (id) => {
  const confirmar = confirm(
    "Tem certeza que deseja excluir esta prestação de contas?"
  );
  if (!confirmar) return;

  try {
    const res = await fetch(`${uriAssembleias}/${id}`, {
      method: "DELETE",
    });

    if (res.status === 200) {
      alert("✅ Excluído com sucesso!");
      listarAssembleias();
    } else {
      alert("❌ Erro ao excluir !");
    }
  } catch (error) {
    console.error("Erro ao excluir :", error);
    alert("❌ Erro ao excluir !");
  }
};

const carregarCondominios = async () => {
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
};

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

const onClickAbrirDocumento = async (documentoUrl) => {
  const response = await fetch(documentoUrl);
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank");
};

const listarAssembleias = async () => {
  try {
    const res = await fetch(uriAssembleias);
    const dados = await res.json();

    tbodyAssembleia.innerHTML = "";

    if (!dados.length) {
      tbodyAssembleia.innerHTML = `
        <tr>
          <td colspan="3" class="text-center text-muted">
            Nenhuma assembleia cadastrada.
          </td>
        </tr>`;
      return;
    }

    dados.forEach((item) => {
      const tr = document.createElement("tr");

      const linkDocumento = item.documentoUrl
        ? `<button onclick=onClickAbrirDocumento("${item.documentoUrl}") class="btn btn-sm btn-primary"> 📄 Abrir PDF </button>`
        : `<span class="text-muted">Sem documento</span>`;

      tr.innerHTML = `
        <td>${item.descricao || "—"}</td>
        <td>${item.nomeCondominio || "—"}</td>
        <td>${linkDocumento}</td>
        <td>
        <button onclick="onClickExcluirDocumento(${
          item.assembleiaid
        })" class="btn btn-sm btn-danger">
          🗑️
        </button>
      </td>
      `;

      tbodyAssembleia.appendChild(tr);
    });
  } catch (error) {
    console.error("Erro ao listar assembleias:", error);
    alert("Erro ao carregar assembleias.");
  }
};

const onSubmitAssembleia = async (e) => {
  e.preventDefault();

  const uploadResult = await cloudinaryUpload(caixaForms.documento.files[0]);

  if (uploadResult.error) {
    alert("❌ Erro ao fazer upload do documento!");
    return;
  }

  try {
    const res = await fetch(uriAssembleias, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        descricao: caixaForms.descricao.value,
        CondominioID: selectCondominio.value,
        documentoUrl: uploadResult.data,
      }),
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
};

caixaForms.addEventListener("submit", onSubmitAssembleia);
carregarCondominios();
listarAssembleias();
