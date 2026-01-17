const baseURL = "https://integrada-api.onrender.com";
const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get("id");

function setText(idEl, value, fallback = "—") {
    const el = document.getElementById(idEl);
    if (!el) return;
    el.textContent = (value && String(value).trim()) ? value : fallback;
}

function showError(msg) {
    const box = document.getElementById("erroBox");
    if (!box) return;
    box.classList.remove("d-none");
    box.innerHTML = `<div class="alert alert-danger mb-0">${msg}</div>`;
}

function normalizeIdFields(obj) {
    // garante comparação com "id" como string
    return String(obj ?? "").trim();
}

async function carregarDetalhes() {
    try {
        if (!id) {
            showError("ID do condomínio não informado na URL. Ex: detalhes-condominio.html?id=17");
            return;
        }

        setText("condominioIdBadge", id);

        // 1) Dados do condomínio
        const resp = await fetch(`${baseURL}/condominiocontroller/${id}`);
        if (!resp.ok) throw new Error("Condomínio não encontrado.");
        const condominio = await resp.json();

        setText("nomeCondominio", condominio.nomecondominio, "Sem nome");
        setText("endereco", condominio.endereco, "Sem endereço");
        setText("telefone", condominio.telefone, "Sem telefone");

        // 2) Proprietários (clientes)
        const propResp = await fetch(`${baseURL}/clientescontroller`);
        if (!propResp.ok) throw new Error("Erro ao buscar proprietários.");
        const proprietarios = await propResp.json();

        const listaProp = document.getElementById("listaProprietarios");
        const props = Array.isArray(proprietarios) ? proprietarios : [];

        const proprietariosDoCondominio = props.filter((p) => {
            const valores = [
                p.CondominioID,
                p.condominioID,
                p.condominioid,
                p.idCondominio
            ].map(normalizeIdFields);
            return valores.includes(String(id));
        });

        if (listaProp) {
            if (proprietariosDoCondominio.length > 0) {
                listaProp.innerHTML = proprietariosDoCondominio.map((p) => `
          <li class="list-group-item">
            <strong>${p.nome || "—"}</strong><br>
            <small>Email: ${p.email || "—"}</small><br>
            <small>Telefone: ${p.telefone || "—"}</small>
          </li>
        `).join("");
            } else {
                listaProp.innerHTML = `<li class="list-group-item text-muted">Nenhum proprietário cadastrado.</li>`;
            }
        }

        // 3) Inquilinos
        const inqResp = await fetch(`${baseURL}/inquilinoscontroller`);
        if (!inqResp.ok) throw new Error("Erro ao buscar inquilinos.");
        const inquilinos = await inqResp.json();

        const listaInq = document.getElementById("listaInquilinos");
        const inqs = Array.isArray(inquilinos) ? inquilinos : [];

        // backend: condominioId
        const inquilinosDoCondominio = inqs.filter((i) => normalizeIdFields(i.condominioId) === String(id));

        if (listaInq) {
            if (inquilinosDoCondominio.length > 0) {
                listaInq.innerHTML = inquilinosDoCondominio.map((i) => `
          <li class="list-group-item">
            <strong>${i.nome || "—"}</strong><br>
            <small>Apartamento: ${i.apartamento || "—"}</small><br>
            <small>Email: ${i.email || "—"}</small><br>
            <small>Telefone: ${i.telefone || "—"}</small>
          </li>
        `).join("");
            } else {
                listaInq.innerHTML = `<li class="list-group-item text-muted">Nenhum inquilino cadastrado.</li>`;
            }
        }

    } catch (err) {
        console.error("Erro ao carregar detalhes:", err);
        showError("Erro ao carregar os detalhes do condomínio.");
    }
}

carregarDetalhes();
