// =========================
// index.js (COMPLETO)
// =========================

// URL base da sua API
const baseURL = "https://integrada-api.onrender.com";

/* ============================================================
   1. Função genérica para contar registros e preencher os cards
============================================================ */
async function contarRegistros(endpoint, elementoID) {
  try {
    const resp = await fetch(`${baseURL}/${endpoint}`);
    const data = await resp.json();
    const alvo = document.getElementById(elementoID);
    if (alvo) {
      alvo.textContent = data.length ?? 0;
    }
  } catch (err) {
    console.error(`Erro ao buscar ${endpoint}:`, err);
    const alvo = document.getElementById(elementoID);
    if (alvo) {
      alvo.textContent = "—";
    }
  }
}

// dispara as contagens dos cards
contarRegistros("condominiocontroller", "qtdCondominios");
contarRegistros("inquilinoscontroller", "qtdInquilinos");
contarRegistros("comunicadoscontroller", "qtdComunicados");
contarRegistros("assembleiascontroller", "qtdAssembleias");

/* ============================================================
   2. Carregar tabela de condomínios no dashboard
============================================================ */
async function carregarTabelaCondominios() {
  const tbodyCondominios = document.getElementById("tbodyCondominiosDashboard");
  if (!tbodyCondominios) return;

  // mostra "carregando..." inicial
  tbodyCondominios.innerHTML = `
    <tr>
      <td colspan="3" class="text-center text-muted py-4">
        Carregando condomínios...
      </td>
    </tr>
  `;

  try {
    const res = await fetch(`${baseURL}/condominiocontroller`);
    const condominios = await res.json();

    if (!condominios || !condominios.length) {
      tbodyCondominios.innerHTML = `
        <tr>
          <td colspan="3" class="text-center text-muted py-4">
            Nenhum condomínio cadastrado ainda.
          </td>
        </tr>
      `;
      return;
    }

    tbodyCondominios.innerHTML = "";

    condominios.forEach((cond) => {
      const id = cond.condominioid;
      const nome = cond.nomecondominio || "—";
      const endereco = cond.endereco || "SEM ENDEREÇO";
      const telefone = cond.telefone || "SEM TELEFONE";

      const linhaHTML = `
        <tr>
          <td class="font-weight-bold">
            <a href="detalhes-condominio.html?id=${id}" class="paiva-link">
              ${nome}
            </a>
          </td>
          <td>${endereco}</td>
          <td>${telefone}</td>
        </tr>
      `;

      tbodyCondominios.innerHTML += linhaHTML;
    });
  } catch (err) {
    console.error("Erro ao carregar condomínios:", err);
    tbodyCondominios.innerHTML = `
      <tr>
        <td colspan="3" class="text-center text-danger py-4">
          Erro ao carregar dados dos condomínios.
        </td>
      </tr>
    `;
  }
}

/* ============================================================
   3. Inicialização da tela
============================================================ */
document.addEventListener("DOMContentLoaded", async () => {
  await carregarTabelaCondominios();
});
