const caixaForms = document.querySelector("#caixaForms");
const uri = "https://integrada-api.onrender.com/comunicadoscontroller";

// Recupera o inquilino logado
const inquilino = JSON.parse(localStorage.getItem("inquilino"));
if (!inquilino) {
  window.location.href = "login_inquilino.html";
}

// Pega o ID do condomínio do inquilino
// (no seu localStorage o campo é "condominioid")
const condominioID = Number(inquilino.condominioid);

async function listarComunicados() {
  try {
    const res = await fetch(uri);
    if (!res.ok) {
      throw new Error("Falha no fetch: " + res.status);
    }

    const dados = await res.json();

    caixaForms.innerHTML = "";

    // Filtra só o que pertence ao mesmo condomínio que o inquilino
    const comunicadosFiltrados = dados.filter(
      (c) => Number(c.CondominioID) === condominioID
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
