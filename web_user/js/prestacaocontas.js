const caixaForms = document.querySelector("#caixaForms");

// Recupera o inquilino logado
const inquilino = JSON.parse(localStorage.getItem("inquilino"));
if (!inquilino) {
  window.location.href = "login_inquilino.html";
}

const condominioID = inquilino.condominioId;
const uri = "https://integrada-api.onrender.com/prestacaocontascontroller";

async function listarPrestacoes() {
  try {
    const res = await fetch(uri);
    const dados = await res.json();

    caixaForms.innerHTML = ""; // limpa cards anteriores

    // Filtra apenas as prestações do condomínio do inquilino
    const prestacoesFiltradas = dados.filter(
      (p) => p.CondominioID === condominioID
    );

    if (prestacoesFiltradas.length === 0) {
      caixaForms.innerHTML = `<p style="text-align:center; color:#666;">Nenhuma prestação de contas disponível para o seu condomínio.</p>`;
      return;
    }

    prestacoesFiltradas.forEach((p) => {
      const card = document.createElement("div");
      card.classList.add("card");

      const dataMes = new Date(p.mes).toLocaleDateString("pt-BR", {
        month: "long",
        year: "numeric",
      });

      const linkDocumento = p.documento
        ? `<a href="https://integrada-api.onrender.com/uploads/prestacoes/${p.documento}" target="_blank" class="btn-ver"><i class="fas fa-file-pdf"></i> Ver PDF</a>`
        : `<span class="sem-doc">Sem documento</span>`;

      card.innerHTML = `
        <i class="fas fa-chart-bar"></i>
        <div>
          <p><strong>Mês de Referência:</strong> ${dataMes}</p>
          <p><strong>Condomínio:</strong> ${
            p.Condominio?.nomecondominio || "—"
          }</p>
          ${linkDocumento}
        </div>
      `;

      caixaForms.appendChild(card);
    });
  } catch (error) {
    console.error("Erro ao listar prestações:", error);
    alert("Erro ao carregar prestações de contas.");
  }
}

listarPrestacoes();
