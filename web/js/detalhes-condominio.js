const baseURL = "https://integrada-api.onrender.com";

const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get("id");

async function carregarDetalhes() {
  try {
    const resp = await fetch(`${baseURL}/condominiocontroller/${id}`);
    const condominio = await resp.json();

    document.getElementById("nomeCondominio").textContent = condominio.nomecondominio;
    document.getElementById("endereco").textContent = condominio.endereco || "Sem endereço";
    document.getElementById("telefone").textContent = condominio.telefone || "Sem telefone";

    // Proprietários
    const propResp = await fetch(`${baseURL}/condominoscontroller?condominioId=${id}`);
    const proprietarios = await propResp.json();
    const listaProp = document.getElementById("listaProprietarios");
    proprietarios.forEach(p => {
      const li = document.createElement("li");
      li.textContent = p.nome;
      listaProp.appendChild(li);
    });

    // Inquilinos
    const inqResp = await fetch(`${baseURL}/inquilinoscontroller?condominioId=${id}`);
    const inquilinos = await inqResp.json();
    const listaInq = document.getElementById("listaInquilinos");
    inquilinos.forEach(i => {
      const li = document.createElement("li");
      li.textContent = i.nome;
      listaInq.appendChild(li);
    });
  } catch (err) {
    console.error("Erro ao carregar detalhes:", err);
  }
}

carregarDetalhes();
