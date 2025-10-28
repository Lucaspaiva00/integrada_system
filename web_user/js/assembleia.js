const assembleiasCards = document.querySelector("#assembleiasCards");

// Recupera o inquilino logado
const inquilino = JSON.parse(localStorage.getItem("inquilino"));
if (!inquilino) {
  window.location.href = "login_inquilino.html";
}

// pega corretamente o ID do condomínio salvo no localStorage
const condominioID = Number(inquilino.condominioid);

async function listarAssembleias() {
  try {
    const res = await fetch("https://integrada-api.onrender.com/assembleiascontroller");
    if (!res.ok) {
      throw new Error("Erro no fetch: " + res.status);
    }

    const dados = await res.json();
    assembleiasCards.innerHTML = "";

    // filtra assembleias do condomínio do inquilino logado
    const assembleiasFiltradas = dados.filter(
      (a) => Number(a.CondominioID) === condominioID
    );

    if (assembleiasFiltradas.length === 0) {
      assembleiasCards.innerHTML = `
        <p style="text-align:center; color:#666;">
          Nenhuma assembleia disponível para o seu condomínio.
        </p>`;
      return;
    }

    assembleiasFiltradas.forEach((a) => {
      const card = document.createElement("div");
      card.classList.add("card");

      const linkDocumento = a.documentoUrl
        ? `<a href="${a.documentoUrl}" target="_blank" class="btn-ver">
             <i class="fas fa-file-pdf"></i> Ver Documento
           </a>`
        : `<span class="sem-doc">Sem documento</span>`;

      card.innerHTML = `
        <i class="fas fa-users"></i>
        <div>
          <p><strong>${a.descricao || "—"}</strong></p>
          <p>Condomínio: ${a.nomeCondominio || "—"}</p>
          <p>Status: ${a.status || "Ativa"}</p>
          ${linkDocumento}
        </div>
      `;

      assembleiasCards.appendChild(card);
    });
  } catch (error) {
    console.error("Erro ao listar assembleias:", error);
    assembleiasCards.innerHTML = `
      <p style="text-align:center; color:red;">
        Erro ao carregar assembleias do servidor.
      </p>`;
  }
}

listarAssembleias();
