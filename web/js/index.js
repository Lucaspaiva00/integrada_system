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
contarRegistros("prestacaocontascontroller", "qtdPrestacoes");

async function graficoComunicados() {
  const resp = await fetch(`${baseURL}/comunicadoscontroller`);
  const data = await resp.json();

  const meses = [
    "Jan",
    "Fev",
    "Mar",
    "Abr",
    "Mai",
    "Jun",
    "Jul",
    "Ago",
    "Set",
    "Out",
    "Nov",
    "Dez",
  ];
  const contagem = new Array(12).fill(0);

  data.forEach((c) => {
    const mes = new Date(c.datacomunicado).getMonth();
    contagem[mes]++;
  });

  const ctx = document.getElementById("graficoComunicados");
  new Chart(ctx, {
    type: "bar",
    data: {
      labels: meses,
      datasets: [
        {
          label: "Comunicados",
          data: contagem,
          backgroundColor: "#4e73df",
        },
      ],
    },
  });
}

graficoComunicados();
