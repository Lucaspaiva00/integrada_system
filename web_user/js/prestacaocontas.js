const caixaForms = document.querySelector("#caixaForms");
const uri = "https://integrada-api.onrender.com/prestacaocontascontroller";

// Recupera o inquilino logado
const inquilino = JSON.parse(localStorage.getItem("inquilino"));
if (!inquilino) {
  window.location.href = "login_inquilino.html";
}

// Mesma lógica dos comunicados: no localStorage é "condominioid"
const condominioID = Number(inquilino.condominioid);

async function listarPrestacoes() {
  try {
    const res = await fetch(uri);
    if (!res.ok) {
      throw new Error("Falha no fetch da prestação: " + res.status);
    }

    const dados = await res.json();

    caixaForms.innerHTML = ""; // limpa cards anteriores

    // Filtra apenas as prestações do condomínio do inquilino
    const prestacoesFiltradas = dados.filter(
      (p) => Number(p.CondominioID) === condominioID
    );

    if (prestacoesFiltradas.length === 0) {
      caixaForms.innerHTML = `
        <p style="text-align:center; color:#666;">
          Nenhuma prestação de contas disponível para o seu condomínio.
        </p>`;
      return;
    }

    prestacoesFiltradas.forEach((p) => {
      const card = document.createElement("div");
      card.classList.add("card");

      // formata o mês e ano
      const dataMes = new Date(p.mes).toLocaleDateString("pt-BR", {
        month: "long",
        year: "numeric",
      });

      const linkDocumento = p.documentoUrl
        ? `<a href="${p.documentoUrl}"
              target="_blank"
              class="btn-ver">
             <i class="fas fa-file-pdf"></i> Ver PDF
           </a>`
        : `<span class="sem-doc">Sem documento</span>`;

      card.innerHTML = `
        <i class="fas fa-chart-bar"></i>
        <div>
          <p><strong>Mês de Referência:</strong> ${dataMes}</p>
          <p><strong>Condomínio:</strong> ${p.nomeCondominio || "—"}</p>
          ${linkDocumento}
        </div>
      `;

      caixaForms.appendChild(card);
    });
  } catch (error) {
    console.error("Erro ao listar prestações:", error);
    caixaForms.innerHTML = `
      <p style="text-align:center; color:red;">
        Erro ao carregar prestações de contas.
      </p>`;
  }
}

listarPrestacoes();
