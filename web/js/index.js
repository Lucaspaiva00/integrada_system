const baseURL = "https://integrada-api.onrender.com";

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

// Chama todas as contagens ao carregar a página
contarRegistros("condominiocontroller", "qtdCondominios");
contarRegistros("inquilinoscontroller", "qtdInquilinos");
contarRegistros("comunicadoscontroller", "qtdComunicados");
contarRegistros("assembleiascontroller", "qtdAssembleias");
// contarRegistros("prestacaocontascontroller", "qtdPrestacoes");

// async function graficoComunicados() {
//   const resp = await fetch(`${baseURL}/comunicadoscontroller`);
//   const data = await resp.json();

//   const meses = [
//     "Jan",
//     "Fev",
//     "Mar",
//     "Abr",
//     "Mai",
//     "Jun",
//     "Jul",
//     "Ago",
//     "Set",
//     "Out",
//     "Nov",
//     "Dez",
//   ];
//   const contagem = new Array(12).fill(0);

//   data.forEach((c) => {
//     const mes = new Date(c.datacomunicado).getMonth();
//     contagem[mes]++;
//   });

//   const ctx = document.getElementById("graficoComunicados");
//   new Chart(ctx, {
//     type: "bar",
//     data: {
//       labels: meses,
//       datasets: [
//         {
//           label: "Comunicados",
//           data: contagem,
//           backgroundColor: "#4e73df",
//         },
//       ],
//     },
//   });
// }

(async function carregarDashboard() {
  const apiBase = "https://integrada-api.onrender.com";

  // pega referências dos elementos
  const qtdCondominiosEl = document.getElementById("qtdCondominios");
  const qtdInquilinosEl = document.getElementById("qtdInquilinos");
  const qtdComunicadosEl = document.getElementById("qtdComunicados");
  const qtdAssembleiasEl = document.getElementById("qtdAssembleias");
  const tbodyCondominios = document.getElementById("tbodyCondominiosDashboard");

  try {
    // 1. Buscar condomínios
    const resConds = await fetch(`${apiBase}/condominiocontroller`);
    const condominios = await resConds.json();

    // Atualiza contador de condomínios
    if (qtdCondominiosEl) {
      qtdCondominiosEl.textContent = condominios.length ?? 0;
    }

    // Monta as linhas da tabela
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
              <td class="font-weight-bold text-dark">${c.nomecondominio || "—"}</td>
              <td>${c.endereco || "—"}</td>
              <td>${c.telefone || "—"}</td>
            </tr>
          `;
        });
      }
    }

    // 2. Buscar inquilinos
    try {
      const resInq = await fetch(`${apiBase}/inquilinoscontroller`);
      const inquilinos = await resInq.json();
      if (qtdInquilinosEl) {
        qtdInquilinosEl.textContent = inquilinos.length ?? 0;
      }
    } catch (errInq) {
      console.warn("Falha ao contar inquilinos:", errInq);
    }

    // 3. Buscar comunicados
    try {
      const resCom = await fetch(`${apiBase}/comunicadoscontroller`);
      const comunicados = await resCom.json();
      if (qtdComunicadosEl) {
        qtdComunicadosEl.textContent = comunicados.length ?? 0;
      }
      // (se quiser futuramente podemos popular o gráfico Comunicados por Mês daqui)
    } catch (errCom) {
      console.warn("Falha ao contar comunicados:", errCom);
    }

    // 4. Buscar assembleias
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


graficoComunicados();
