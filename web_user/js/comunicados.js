const caixaForms = document.querySelector("#caixaForms");

// Recupera o inquilino logado
const inquilino = JSON.parse(localStorage.getItem("inquilino"));
if (!inquilino) {
  window.location.href = "login_inquilino.html";
}

const condominioID = inquilino.Condominio.condominioid;
const uri = "https://integrada-api.onrender.com/comunicadoscontroller";

async function listarComunicados() {
  try {
    const res = await fetch(uri);
    const dados = await res.json();

    caixaForms.innerHTML = ""; // limpa os comunicados anteriores

    // Filtra apenas comunicados do condomínio do inquilino logado
    const comunicadosFiltrados = dados.filter(
      (c) => c.CondominioID === condominioID
    );

    if (comunicadosFiltrados.length === 0) {
      caixaForms.innerHTML = `<p style="text-align:center; color:#666;">Nenhum comunicado disponível para o seu condomínio.</p>`;
      return;
    }

    comunicadosFiltrados.forEach((e) => {
      const card = document.createElement("div");
      card.classList.add("card");

      const linkDocumento = e.documento
        ? `<a href="https://integrada-api.onrender.com/uploads/comunicados/${e.documento}" target="_blank" class="btn-ver"><i class="fas fa-file-pdf"></i> Ver Documento</a>`
        : `<span class="sem-doc">Sem documento</span>`;

      card.innerHTML = `
        <h4><i class="fas fa-bullhorn"></i> ${e.datacomunicado}</h4>
        <p>${e.descricao}</p>
        ${linkDocumento}
      `;

      caixaForms.appendChild(card);
    });
  } catch (error) {
    console.error("Erro ao listar comunicados:", error);
    alert("Erro ao carregar comunicados.");
  }
}

listarComunicados();
