const baseURL = "https://integrada-api.onrender.com";
const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get("id");

async function carregarDetalhes() {
  try {
    // Busca os dados do condomínio
    const resp = await fetch(`${baseURL}/condominiocontroller/${id}`);
    if (!resp.ok) throw new Error("Condomínio não encontrado");
    const condominio = await resp.json();

    document.getElementById("nomeCondominio").textContent = condominio.nomecondominio;
    document.getElementById("endereco").textContent = condominio.endereco || "Sem endereço";
    document.getElementById("telefone").textContent = condominio.telefone || "Sem telefone";

    // Proprietários
    const propResp = await fetch(`${baseURL}/condominoscontroller?CondominioID=${id}`);
    const proprietarios = await propResp.json();

    const listaProp = document.getElementById("listaProprietarios");
    listaProp.innerHTML = proprietarios.length
      ? proprietarios.map(p => `<li class="list-group-item">${p.nome}</li>`).join("")
      : "<li class='list-group-item text-muted'>Nenhum proprietário cadastrado</li>";

    // Inquilinos
    const inqResp = await fetch(`${baseURL}/inquilinoscontroller?CondominioID=${id}`);
    const inquilinos = await inqResp.json();

    const listaInq = document.getElementById("listaInquilinos");
    listaInq.innerHTML = inquilinos.length
      ? inquilinos.map(i => `<li class="list-group-item">${i.nome}</li>`).join("")
      : "<li class='list-group-item text-muted'>Nenhum inquilino cadastrado</li>";

  } catch (err) {
    console.error("Erro ao carregar detalhes:", err);
    document.querySelector(".card-body").innerHTML = `
      <div class="alert alert-danger">Erro ao carregar os detalhes do condomínio.</div>`;
  }
}

carregarDetalhes();
