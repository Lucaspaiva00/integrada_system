const baseURL = "https://integrada-api.onrender.com";

/* ============================================================
   Função genérica de contagem de registros por endpoint
============================================================ */
async function contarRegistros(endpoint, elementoID) {
  try {
    const resp = await fetch(`${baseURL}/${endpoint}`);
    const data = await resp.json();
    document.getElementById(elementoID).textContent = data.length;
  } catch (err) {
    console.error(`Erro ao buscar ${endpoint}:`, err);
    document.getElementById(elementoID).textContent = "—";
  }
}

/* ============================================================
   Contadores de cards (condomínios, inquilinos, etc)
============================================================ */
contarRegistros("condominiocontroller", "qtdCondominios");
contarRegistros("inquilinoscontroller", "qtdInquilinos");
contarRegistros("comunicadoscontroller", "qtdComunicados");
contarRegistros("assembleiascontroller", "qtdAssembleias");

/* ============================================================
   Carregamento principal do Dashboard
============================================================ */
(async function carregarDashboard() {
  const apiBase = "https://integrada-api.onrender.com";

  // pega referências dos elementos
  const qtdCondominiosEl = document.getElementById("qtdCondominios");
  const qtdInquilinosEl = document.getElementById("qtdInquilinos");
  const qtdComunicadosEl = document.getElementById("qtdComunicados");
  const qtdAssembleiasEl = document.getElementById("qtdAssembleias");
  const tbodyCondominios = document.getElementById("tbodyCondominiosDashboard");

  try {
    /* ----------------------------------------
       1️⃣ Buscar e listar condomínios
    ---------------------------------------- */
    const resConds = await fetch(`${apiBase}/condominiocontroller`);
    const condominios = await resConds.json();

    // Atualiza contador de condomínios
    if (qtdCondominiosEl) {
      qtdCondominiosEl.textContent = condominios.length ?? 0;
    }

    // Monta as linhas da tabela com link para detalhes
    if (tbodyCondominios) {
      if (!condominios.length) {
        tbodyCondominios.innerHTML = `
          <tr>
            <td colspan="3" class="text-center text-muted py-4">
              Nenhum condomínio cadastrado ainda.
            </td>
          </tr>`;
      } else {
        tbodyCondominios.innerHTML = ""; // limpa o "Carregando..."

        condominios.forEach((c) => {
          tbodyCondominios.innerHTML += `
            <tr>
              <td>
                <a href="detalhes-condominio.html?id=${c.condominioid}"
                   class="text-primary font-weight-bold"
                   style="cursor:pointer; text-decoration:none;">
                   ${c.nomecondominio || "—"}
                </a>
              </td>
              <td>${c.endereco || "—"}</td>
              <td>${c.telefone || "—"}</td>
            </tr>
          `;
        });
      }
    }

    /* ----------------------------------------
       2️⃣ Buscar total de inquilinos
    ---------------------------------------- */
    try {
      const resInq = await fetch(`${apiBase}/inquilinoscontroller`);
      const inquilinos = await resInq.json();
      if (qtdInquilinosEl) {
        qtdInquilinosEl.textContent = inquilinos.length ?? 0;
      }
    } catch (errInq) {
      console.warn("Falha ao contar inquilinos:", errInq);
    }

    /* ----------------------------------------
       3️⃣ Buscar total de comunicados
    ---------------------------------------- */
    try {
      const resCom = await fetch(`${apiBase}/comunicadoscontroller`);
      const comunicados = await resCom.json();
      if (qtdComunicadosEl) {
        qtdComunicadosEl.textContent = comunicados.length ?? 0;
      }
    } catch (errCom) {
      console.warn("Falha ao contar comunicados:", errCom);
    }

    /* ----------------------------------------
       4️⃣ Buscar total de assembleias
    ---------------------------------------- */
    try {
      const resAsm = await fetch(`${apiBase}/assembleiascontroller`);
      const assembleias = await resAsm.json();
      if (qtdAssembleiasEl) {
        qtdAssembleiasEl.textContent = assembleias.length ?? 0;
      }
    } catch (errAsm) {
      console.warn("Falha ao contar assembleias:", errAsm);
    }

  } catch (err) {
    console.error("Erro geral ao carregar dashboard:", err);
    if (tbodyCondominios) {
      tbodyCondominios.innerHTML = `
        <tr>
          <td colspan="3" class="text-center text-danger py-4">
            Erro ao carregar dados dos condomínios.
          </td>
        </tr>`;
    }
  }
})();