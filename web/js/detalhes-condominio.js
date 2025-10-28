const baseURL = "https://integrada-api.onrender.com";
const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get("id");

async function carregarDetalhes() {
    try {
        // 1️⃣ Buscar dados do condomínio
        const resp = await fetch(`${baseURL}/condominiocontroller/${id}`);
        if (!resp.ok) throw new Error("Condomínio não encontrado.");
        const condominio = await resp.json();

        document.getElementById("nomeCondominio").textContent = condominio.nomecondominio || "Sem nome";
        document.getElementById("endereco").textContent = condominio.endereco || "Sem endereço";
        document.getElementById("telefone").textContent = condominio.telefone || "Sem telefone";

        // 2️⃣ Buscar proprietários (clientes) relacionados
        const propResp = await fetch(`${baseURL}/clientescontroller`);
        const proprietarios = await propResp.json();
        const listaProp = document.getElementById("listaProprietarios");

        const proprietariosDoCondominio = proprietarios.filter(
            (p) => p.CondominioID == id
        );

        if (proprietariosDoCondominio.length > 0) {
            listaProp.innerHTML = proprietariosDoCondominio
                .map(
                    (p) => `
          <li class="list-group-item">
            <strong>${p.nome}</strong><br>
            <small>Email: ${p.email || "—"}</small><br>
            <small>Telefone: ${p.telefone || "—"}</small>
          </li>`
                )
                .join("");
        } else {
            listaProp.innerHTML = `<li class="list-group-item text-muted">Nenhum proprietário cadastrado.</li>`;
        }

        // 3️⃣ Buscar inquilinos relacionados
        const inqResp = await fetch(`${baseURL}/inquilinoscontroller`);
        const inquilinos = await inqResp.json();
        const listaInq = document.getElementById("listaInquilinos");

        const inquilinosDoCondominio = inquilinos.filter(
            (i) => i.CondominioID == id
        );

        if (inquilinosDoCondominio.length > 0) {
            listaInq.innerHTML = inquilinosDoCondominio
                .map(
                    (i) => `
          <li class="list-group-item">
            <strong>${i.nome}</strong><br>
            <small>Email: ${i.email || "—"}</small><br>
            <small>Telefone: ${i.telefone || "—"}</small>
          </li>`
                )
                .join("");
        } else {
            listaInq.innerHTML = `<li class="list-group-item text-muted">Nenhum inquilino cadastrado.</li>`;
        }

    } catch (err) {
        console.error("Erro ao carregar detalhes:", err);
        document.querySelector(".card-body").innerHTML = `
      <div class="alert alert-danger">Erro ao carregar os detalhes do condomínio.</div>`;
    }
}

carregarDetalhes();
