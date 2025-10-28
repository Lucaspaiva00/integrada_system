// const caixaForms = document.querySelector("#caixaForms");

// // Recupera o inquilino logado
// const inquilino = JSON.parse(localStorage.getItem("inquilino"));
// if (!inquilino) {
//   window.location.href = "login_inquilino.html";
// }

// const condominioID = inquilino.condominioId;
// const uri = "https://integrada-api.onrender.com/comunicadoscontroller";

// async function listarComunicados() {
//   try {
//     const res = await fetch(uri);
//     const dados = await res.json();

//     caixaForms.innerHTML = ""; // limpa os comunicados anteriores

//     // Filtra apenas comunicados do condomínio do inquilino logado
//     const comunicadosFiltrados = dados.filter(
//       (c) => c.CondominioID === condominioID
//     );

//     if (comunicadosFiltrados.length === 0) {
//       caixaForms.innerHTML = `<p style="text-align:center; color:#666;">Nenhum comunicado disponível para o seu condomínio.</p>`;
//       return;
//     }

//     comunicadosFiltrados.forEach((e) => {
//       const card = document.createElement("div");
//       card.classList.add("card");

//       const linkDocumento = e.documento
//         ? `<a href="https://integrada-api.onrender.com/documentos/comunicados/${e.documento}" target="_blank" class="btn-ver"><i class="fas fa-file-pdf"></i> Ver Documento</a>`
//         : `<span class="sem-doc">Sem documento</span>`;

//       card.innerHTML = `
//         <h4><i class="fas fa-bullhorn"></i> ${e.datacomunicado}</h4>
//         <p>${e.descricao}</p>
//         ${linkDocumento}
//       `;

//       caixaForms.appendChild(card);
//     });
//   } catch (error) {
//     console.error("Erro ao listar comunicados:", error);
//     alert("Erro ao carregar comunicados.");
//   }
// }

// listarComunicados();
const caixaForms = document.querySelector("#caixaForms");

// Pega o inquilino logado
const inquilino = JSON.parse(localStorage.getItem("inquilino"));
if (!inquilino) {
  window.location.href = "login_inquilino.html";
}

// usa o campo que você salva no localStorage
const condominioID = Number(inquilino.condominioId);

const uri = "https://integrada-api.onrender.com/comunicadoscontroller";

async function listarComunicados() {
  try {
    const res = await fetch(uri);
    if (!res.ok) {
      throw new Error("Falha no fetch: " + res.status);
    }

    const dados = await res.json();

    caixaForms.innerHTML = "";

    // aqui CondominioID já vem como Number do backend
    const comunicadosFiltrados = dados.filter(
      (c) => c.CondominioID === condominioID
    );

    if (comunicadosFiltrados.length === 0) {
      caixaForms.innerHTML = `
        <p style="text-align:center; color:#666;">
          Nenhum comunicado disponível para o seu condomínio.
        </p>`;
      return;
    }

    comunicadosFiltrados.forEach((c) => {
      const card = document.createElement("div");
      card.classList.add("card");

      const linkDocumento = c.documentoUrl
        ? `<a href="${c.documentoUrl}" target="_blank" class="btn-ver">
             <i class="fas fa-file-pdf"></i> Ver Documento
           </a>`
        : `<span class="sem-doc">Sem documento</span>`;

      card.innerHTML = `
        <h4><i class="fas fa-bullhorn"></i> ${c.datacomunicado}</h4>
        <p>${c.descricao}</p>
        ${linkDocumento}
      `;

      caixaForms.appendChild(card);
    });
  } catch (error) {
    console.error("Erro ao listar comunicados:", error);
    caixaForms.innerHTML = `
      <p style="text-align:center; color:red;">
        Erro ao carregar comunicados do servidor.
      </p>`;
  }
}

listarComunicados();

