const assembleiasCards = document.querySelector("#assembleiasCards");

// Recupera o inquilino logado
const inquilino = JSON.parse(localStorage.getItem("inquilino"));
if (!inquilino) {
  window.location.href = "login_inquilino.html";
}
const condominioID = inquilino.condominioId;

async function listarAssembleias() {
  try {
    const res = await fetch(
      "https://integrada-api.onrender.com/assembleiascontroller"
    );
    const dados = await res.json();

    assembleiasCards.innerHTML = ""; // limpa os cards

    // Filtra somente as assembleias do condomínio do inquilino logado
    const assembleiasFiltradas = dados.filter(
      (a) => a.CondominioID === condominioID
    );

    if (assembleiasFiltradas.length === 0) {
      assembleiasCards.innerHTML = `<p style="text-align:center; color:#666;">Nenhuma assembleia disponível para o seu condomínio.</p>`;
      return;
    }

    assembleiasFiltradas.forEach((item) => {
      const card = document.createElement("div");
      card.classList.add("card");

      const linkDocumento = item.documento
        ? `<a href="https://integrada-api.onrender.com/uploads/assembleia/${item.documento}" target="_blank" class="btn-ver"><i class="fas fa-file-pdf"></i> Ver Documento</a>`
        : `<span class="sem-doc">Sem documento</span>`;

      card.innerHTML = `
        <i class="fas fa-users"></i>
        <div>
          <p><strong>${item.descricao || "—"}</strong></p>
          <p>${item.Condominio?.nomecondominio || "—"}</p>
          <p>Status: ${item.status || "Ativa"}</p>
          ${linkDocumento}
        </div>
      `;

      assembleiasCards.appendChild(card);
    });
  } catch (error) {
    console.error("Erro ao listar assembleias:", error);
    alert("Erro ao carregar assembleias.");
  }
}

listarAssembleias();
