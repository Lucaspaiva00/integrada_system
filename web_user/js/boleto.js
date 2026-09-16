const caixaBoletos = document.querySelector("#caixaBoletos");
const baseURL = "https://integrada-api.onrender.com";

// Recupera o morador logado (mesmo padrão de comunicados.js / assembleia.js)
const inquilino = JSON.parse(localStorage.getItem("inquilino"));
if (!inquilino) {
  window.location.href = "login_inquilino.html";
}

const clienteID = Number(inquilino.clienteid);

function formatarMoeda(valor) {
  const numero = Number(valor);
  if (Number.isNaN(numero)) return "—";
  return numero.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatarData(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR");
}

function copiarLinhaDigitavel(botao, linha) {
  navigator.clipboard.writeText(linha).then(() => {
    const textoOriginal = botao.textContent;
    botao.textContent = "Copiado!";
    setTimeout(() => (botao.textContent = textoOriginal), 1500);
  });
}
window.copiarLinhaDigitavel = copiarLinhaDigitavel;

async function listarBoletos() {
  if (!clienteID) {
    caixaBoletos.innerHTML = `
      <p style="text-align:center; color:red;">
        Não encontrei seu cadastro completo. Faça login novamente.
      </p>`;
    return;
  }

  try {
    const res = await fetch(`${baseURL}/boletoscontroller?clienteid=${clienteID}`);
    if (!res.ok) throw new Error("Falha no fetch: " + res.status);

    const boletos = await res.json();

    caixaBoletos.innerHTML = "";

    if (!Array.isArray(boletos) || boletos.length === 0) {
      caixaBoletos.innerHTML = `
        <p style="text-align:center; color:#666;">
          Nenhum boleto disponível ainda para a sua unidade.
        </p>`;
      return;
    }

    // mais recente primeiro (a API já ordena por vencimento desc, mas garante aqui também)
    boletos
      .sort((a, b) => new Date(b.vencimento) - new Date(a.vencimento))
      .forEach((b) => {
        const card = document.createElement("div");
        card.classList.add("boleto-card");

        const competencia = new Date(b.competencia).toLocaleDateString("pt-BR", {
          month: "long",
          year: "numeric",
        });

        const itensHtml = (b.Itens || [])
          .map((item) => `<div>${item.descricao}: ${formatarMoeda(item.valorTotal)}</div>`)
          .join("");

        const linhaDigitavel = b.linhaDigitavel
          ? `
            <div class="boleto-card__linha">
              <span style="flex:1;">${b.linhaDigitavel}</span>
              <button onclick="copiarLinhaDigitavel(this, '${b.linhaDigitavel}')">Copiar</button>
            </div>`
          : b.status === "PENDENTE"
            ? `<p style="font-size:0.8rem; color:#888; margin-top:8px;">Aguardando confirmação do banco...</p>`
            : "";

        card.innerHTML = `
          <div class="boleto-card__topo">
            <div>
              <div style="font-size:0.85rem; color:#666; text-transform:capitalize;">Competência: ${competencia}</div>
              <div class="boleto-card__valor">${formatarMoeda(b.valorTotal)}</div>
              <div style="font-size:0.85rem; color:#666;">Vencimento: ${formatarData(b.vencimento)}</div>
            </div>
            <span class="boleto-status ${b.status}">${b.status}</span>
          </div>
          ${linhaDigitavel}
          ${itensHtml ? `
            <details class="boleto-card__itens">
              <summary>Ver composição do boleto</summary>
              ${itensHtml}
            </details>` : ""}
        `;

        caixaBoletos.appendChild(card);
      });
  } catch (error) {
    console.error("Erro ao listar boletos:", error);
    caixaBoletos.innerHTML = `
      <p style="text-align:center; color:red;">
        Erro ao carregar seus boletos. Tente novamente em instantes.
      </p>`;
  }
}

listarBoletos();
