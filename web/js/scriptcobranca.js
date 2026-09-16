// =========================
// scriptcobranca.js
// =========================

const baseURL = "https://integrada-api.onrender.com";

const selectCondominio = document.querySelector("#selectCondominio");

const formConfig = document.querySelector("#formConfig");
const btnSalvarConfig = document.querySelector("#btnSalvarConfig");

const formItem = document.querySelector("#formItem");
const btnSalvarItem = document.querySelector("#btnSalvarItem");
const selectTipoItem = document.querySelector("#selectTipoItem");
const campoValorPadrao = document.querySelector("#campoValorPadrao");
const campoValorMedido = document.querySelector("#campoValorMedido");
const campoUnidadeMedida = document.querySelector("#campoUnidadeMedida");
const tbodyItens = document.querySelector("#tbodyItens");

const formLote = document.querySelector("#formLote");
const btnGerarLote = document.querySelector("#btnGerarLote");
const resultadoLote = document.querySelector("#resultadoLote");

const selectUnidade = document.querySelector("#selectUnidade");
const formIndividual = document.querySelector("#formIndividual");
const btnGerarIndividual = document.querySelector("#btnGerarIndividual");
const resultadoIndividual = document.querySelector("#resultadoIndividual");

const btnAtualizarBoletos = document.querySelector("#btnAtualizarBoletos");
const tbodyBoletos = document.querySelector("#tbodyBoletos");
const selectFiltroUnidade = document.querySelector("#selectFiltroUnidade");

// =========================
// TOAST (mesmo padrão das outras páginas do admin)
// =========================
const toast = document.getElementById("toast");
const toastTitle = document.getElementById("toastTitle");
const toastMsg = document.getElementById("toastMsg");
const toastIcon = document.getElementById("toastIcon");
const toastClose = document.getElementById("toastClose");
let toastTimer = null;

function showToast({ type = "success", title = "Tudo certo", message = "" }) {
  toast.classList.remove("is-success", "is-error", "is-info", "is-warn");
  const map = {
    success: { cls: "is-success", icon: "fa-check" },
    error: { cls: "is-error", icon: "fa-times" },
    info: { cls: "is-info", icon: "fa-info" },
    warn: { cls: "is-warn", icon: "fa-exclamation" },
  };
  const cfg = map[type] || map.success;
  toast.classList.add(cfg.cls);
  toastTitle.textContent = title;
  toastMsg.textContent = message;
  toastIcon.innerHTML = `<i class="fas ${cfg.icon}"></i>`;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 3200);
}
toastClose?.addEventListener("click", () => {
  toast.classList.remove("show");
  clearTimeout(toastTimer);
});

function escapeHtml(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatarMoeda(valor) {
  const numero = Number(valor);
  if (Number.isNaN(numero)) return "—";
  return numero.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatarData(iso) {
  if (!iso) return "—";
  const data = new Date(iso);
  return data.toLocaleDateString("pt-BR");
}

const STATUS_BADGE = {
  PENDENTE: "badge-warning",
  REGISTRADO: "badge-info",
  PAGO: "badge-success",
  VENCIDO: "badge-danger",
  CANCELADO: "badge-secondary",
  ERRO: "badge-danger",
};

function condominioSelecionado() {
  return selectCondominio.value ? Number(selectCondominio.value) : null;
}

// =========================
// 1) Carregar condomínios no seletor
// =========================
async function carregarCondominios() {
  try {
    const res = await fetch(`${baseURL}/condominiocontroller`);
    const dados = await res.json();

    selectCondominio.innerHTML = `<option value="">Selecione...</option>`;
    (Array.isArray(dados) ? dados : []).forEach((c) => {
      const opt = document.createElement("option");
      opt.value = c.condominioid;
      opt.textContent = c.nomecondominio;
      selectCondominio.appendChild(opt);
    });
  } catch (err) {
    console.error(err);
    selectCondominio.innerHTML = `<option value="">Erro ao carregar condomínios</option>`;
    showToast({ type: "error", title: "Falha de conexão", message: "Não consegui carregar os condomínios." });
  }
}

selectCondominio.addEventListener("change", () => {
  const id = condominioSelecionado();
  if (!id) return;
  carregarConfig(id);
  carregarItens(id);
  carregarUnidades(id);
  carregarBoletos(id);
});

// =========================
// Unidades do condomínio (pra geração individual)
// =========================
async function carregarUnidades(condominioId) {
  try {
    selectUnidade.innerHTML = `<option value="">Carregando unidades...</option>`;
    const res = await fetch(`${baseURL}/clientescontroller`);
    const clientes = await res.json();

    const doCondominio = (Array.isArray(clientes) ? clientes : []).filter(
      (c) => Number(c.CondominioID) === Number(condominioId)
    );

    if (!doCondominio.length) {
      selectUnidade.innerHTML = `<option value="">Nenhuma unidade cadastrada neste condomínio</option>`;
      selectFiltroUnidade.innerHTML = `<option value="">Todas as unidades do condomínio</option>`;
      return;
    }

    selectUnidade.innerHTML = `<option value="">Selecione a unidade...</option>`;
    selectFiltroUnidade.innerHTML = `<option value="">Todas as unidades do condomínio</option>`;
    doCondominio.forEach((c) => {
      const rotulo = `Apto ${c.apartamento} - ${c.nome}`;

      const opt = document.createElement("option");
      opt.value = c.clienteid;
      opt.textContent = rotulo;
      selectUnidade.appendChild(opt);

      const optFiltro = document.createElement("option");
      optFiltro.value = c.clienteid;
      optFiltro.textContent = rotulo;
      selectFiltroUnidade.appendChild(optFiltro);
    });
  } catch (err) {
    console.error(err);
    selectUnidade.innerHTML = `<option value="">Erro ao carregar unidades</option>`;
  }
}

formIndividual.addEventListener("submit", async (e) => {
  e.preventDefault();

  const clienteid = selectUnidade.value;
  if (!clienteid) {
    showToast({ type: "warn", title: "Atenção", message: "Selecione a unidade." });
    return;
  }

  const mesInput = formIndividual.competenciaIndividual.value;
  if (!mesInput) {
    showToast({ type: "warn", title: "Atenção", message: "Escolha a competência (mês)." });
    return;
  }
  const competencia = `${mesInput}-01`;

  btnGerarIndividual.disabled = true;
  resultadoIndividual.innerHTML = `<div class="text-muted mt-2">Gerando boleto...</div>`;

  try {
    const res = await fetch(`${baseURL}/boletoscontroller`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clienteid: Number(clienteid), competencia }),
    });

    const dados = await res.json();

    if (res.status === 201) {
      resultadoIndividual.innerHTML = `<div class="alert alert-success mt-2 mb-0">Boleto gerado com sucesso.</div>`;
      showToast({ type: "success", title: "Boleto gerado", message: "Já aparece na lista abaixo." });
      formIndividual.reset();
      carregarBoletos(condominioSelecionado());
    } else {
      resultadoIndividual.innerHTML = `<div class="alert alert-danger mt-2 mb-0">${escapeHtml(dados.error || "Não foi possível gerar o boleto.")}</div>`;
    }
  } catch (err) {
    console.error(err);
    resultadoIndividual.innerHTML = `<div class="alert alert-danger mt-2 mb-0">Falha de conexão ao gerar o boleto.</div>`;
  } finally {
    btnGerarIndividual.disabled = false;
  }
});

// =========================
// 2) Configuração de cobrança
// =========================
async function carregarConfig(condominioId) {
  try {
    const res = await fetch(`${baseURL}/configuracaocobrancacontroller/${condominioId}`);

    if (res.status === 404) {
      // ainda não configurado - mantém os valores padrão do formulário
      formConfig.reset();
      return;
    }

    const config = await res.json();
    formConfig.diaVencimento.value = config.diaVencimento ?? 10;
    formConfig.percentualMulta.value = config.percentualMulta ?? 2;
    formConfig.percentualJurosAoMes.value = config.percentualJurosAoMes ?? 1;
    formConfig.percentualDescontoAntecipado.value = config.percentualDescontoAntecipado ?? 0;
    formConfig.diasDescontoAntecipado.value = config.diasDescontoAntecipado ?? 0;
    formConfig.santanderWorkspaceId.value = config.santanderWorkspaceId ?? "";
  } catch (err) {
    console.error(err);
    showToast({ type: "error", title: "Erro", message: "Não consegui carregar a configuração deste condomínio." });
  }
}

formConfig.addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = condominioSelecionado();
  if (!id) {
    showToast({ type: "warn", title: "Atenção", message: "Selecione um condomínio primeiro." });
    return;
  }

  const payload = {
    diaVencimento: Number(formConfig.diaVencimento.value),
    percentualMulta: Number(formConfig.percentualMulta.value),
    percentualJurosAoMes: Number(formConfig.percentualJurosAoMes.value),
    percentualDescontoAntecipado: Number(formConfig.percentualDescontoAntecipado.value || 0),
    diasDescontoAntecipado: Number(formConfig.diasDescontoAntecipado.value || 0),
    santanderWorkspaceId: formConfig.santanderWorkspaceId.value.trim() || undefined,
  };

  btnSalvarConfig.disabled = true;
  try {
    const res = await fetch(`${baseURL}/configuracaocobrancacontroller/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      showToast({ type: "success", title: "Configuração salva", message: "As regras deste condomínio foram atualizadas." });
    } else {
      showToast({ type: "error", title: "Erro ao salvar", message: "Não foi possível salvar a configuração." });
    }
  } catch (err) {
    console.error(err);
    showToast({ type: "error", title: "Falha de conexão", message: "Verifique a internet / API e tente novamente." });
  } finally {
    btnSalvarConfig.disabled = false;
  }
});

// =========================
// 3) Catálogo de itens de cobrança
// =========================
selectTipoItem.addEventListener("change", () => {
  const tipo = selectTipoItem.value;
  campoValorPadrao.classList.toggle("d-none", tipo !== "FIXO");
  campoValorMedido.classList.toggle("d-none", tipo !== "MEDIDO");
  campoUnidadeMedida.classList.toggle("d-none", tipo !== "MEDIDO");
});

async function carregarItens(condominioId) {
  try {
    tbodyItens.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-4">Carregando itens...</td></tr>`;
    const res = await fetch(`${baseURL}/itenscobrancacontroller?condominioid=${condominioId}`);
    const itens = await res.json();
    renderItens(Array.isArray(itens) ? itens : []);
  } catch (err) {
    console.error(err);
    tbodyItens.innerHTML = `<tr><td colspan="5" class="text-center text-danger py-4">Erro ao carregar itens.</td></tr>`;
  }
}

function renderItens(itens) {
  if (!itens.length) {
    tbodyItens.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-4">Nenhum item cadastrado ainda para este condomínio.</td></tr>`;
    return;
  }

  tbodyItens.innerHTML = "";
  itens.forEach((item) => {
    const valor = item.tipo === "FIXO"
      ? formatarMoeda(item.valorPadrao)
      : item.tipo === "MEDIDO"
        ? `${formatarMoeda(item.valorPorUnidade)} / ${escapeHtml(item.unidadeMedida || "un.")}`
        : "definido a cada mês";

    const tr = document.createElement("tr");
    if (!item.ativo) tr.classList.add("text-muted");
    tr.innerHTML = `
      <td class="font-weight-bold">${escapeHtml(item.nome)}</td>
      <td>${escapeHtml(item.tipo)}</td>
      <td>${valor}</td>
      <td>${item.obrigatorio ? "Obrigatório" : "Opcional"}</td>
      <td>
        ${item.ativo
          ? `<button class="btn btn-sm btn-light paiva-btn-light" data-action="desativar" data-id="${item.itemcobrancaid}"><i class="fas fa-eye-slash mr-1"></i> Desativar</button>`
          : `<span class="badge badge-secondary">Desativado</span>`}
      </td>
    `;
    tbodyItens.appendChild(tr);
  });
}

tbodyItens.addEventListener("click", async (e) => {
  const btn = e.target.closest("button[data-action='desativar']");
  if (!btn) return;

  const id = btn.getAttribute("data-id");
  try {
    const res = await fetch(`${baseURL}/itenscobrancacontroller/${id}`, { method: "DELETE" });
    if (res.ok) {
      showToast({ type: "success", title: "Item desativado", message: "Ele não vai mais entrar nos próximos boletos." });
      carregarItens(condominioSelecionado());
    } else {
      showToast({ type: "error", title: "Erro", message: "Não foi possível desativar o item." });
    }
  } catch (err) {
    console.error(err);
    showToast({ type: "error", title: "Falha de conexão", message: "Verifique a internet / API e tente novamente." });
  }
});

formItem.addEventListener("submit", async (e) => {
  e.preventDefault();
  const condominioId = condominioSelecionado();
  if (!condominioId) {
    showToast({ type: "warn", title: "Atenção", message: "Selecione um condomínio primeiro." });
    return;
  }

  const tipo = formItem.tipo.value;
  const payload = {
    CondominioID: condominioId,
    nome: formItem.nome.value.trim(),
    tipo,
    obrigatorio: formItem.obrigatorio.value === "true",
  };

  if (tipo === "FIXO") payload.valorPadrao = Number(formItem.valorPadrao.value);
  if (tipo === "MEDIDO") {
    payload.valorPorUnidade = Number(formItem.valorPorUnidade.value);
    payload.unidadeMedida = formItem.unidadeMedida.value.trim() || "un.";
  }

  if (!payload.nome) {
    showToast({ type: "warn", title: "Atenção", message: "Dê um nome para o item." });
    return;
  }

  btnSalvarItem.disabled = true;
  try {
    const res = await fetch(`${baseURL}/itenscobrancacontroller`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.status === 201 || res.ok) {
      showToast({ type: "success", title: "Item criado", message: `"${payload.nome}" já entra nos próximos boletos.` });
      formItem.reset();
      selectTipoItem.dispatchEvent(new Event("change"));
      carregarItens(condominioId);
    } else {
      const erro = await res.json().catch(() => ({}));
      showToast({ type: "error", title: "Erro ao criar item", message: erro.error || "Não foi possível criar o item." });
    }
  } catch (err) {
    console.error(err);
    showToast({ type: "error", title: "Falha de conexão", message: "Verifique a internet / API e tente novamente." });
  } finally {
    btnSalvarItem.disabled = false;
  }
});

// =========================
// 4) Geração de boletos em lote
// =========================
formLote.addEventListener("submit", async (e) => {
  e.preventDefault();
  const condominioId = condominioSelecionado();
  if (!condominioId) {
    showToast({ type: "warn", title: "Atenção", message: "Selecione um condomínio primeiro." });
    return;
  }

  const mesInput = formLote.competencia.value; // formato "AAAA-MM"
  if (!mesInput) {
    showToast({ type: "warn", title: "Atenção", message: "Escolha a competência (mês)." });
    return;
  }
  const competencia = `${mesInput}-01`;

  btnGerarLote.disabled = true;
  resultadoLote.innerHTML = `<div class="text-muted">Gerando boletos, isso pode levar alguns segundos...</div>`;

  try {
    const res = await fetch(`${baseURL}/boletoscontroller/lote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ condominioid: condominioId, competencia }),
    });

    const dados = await res.json();
    renderResultadoLote(dados);
    carregarBoletos(condominioId);
  } catch (err) {
    console.error(err);
    resultadoLote.innerHTML = `<div class="alert alert-danger mb-0">Falha de conexão ao gerar os boletos.</div>`;
  } finally {
    btnGerarLote.disabled = false;
  }
});

function renderResultadoLote(dados) {
  if (!dados || !Array.isArray(dados.resultados)) {
    resultadoLote.innerHTML = `<div class="alert alert-danger mb-0">Resposta inesperada da API.</div>`;
    return;
  }

  const linhas = dados.resultados.map((r) => {
    if (r.ok) {
      return `<li class="text-success"><i class="fas fa-check mr-1"></i> Unidade ${escapeHtml(r.apartamento)} - boleto gerado.</li>`;
    }
    return `<li class="text-danger"><i class="fas fa-times mr-1"></i> Unidade ${escapeHtml(r.apartamento)}: ${escapeHtml(r.erro)}</li>`;
  }).join("");

  resultadoLote.innerHTML = `
    <div class="alert ${dados.falhas > 0 ? "alert-warning" : "alert-success"} mb-2">
      <strong>${dados.sucesso}</strong> de <strong>${dados.total}</strong> boletos gerados com sucesso.
      ${dados.falhas > 0 ? `<strong>${dados.falhas}</strong> precisam de atenção (veja abaixo).` : ""}
    </div>
    <ul class="pl-3 mb-0" style="font-size: 0.9rem;">${linhas}</ul>
  `;
}

// =========================
// 5) Listagem de boletos
// =========================
async function carregarBoletos(condominioId) {
  try {
    tbodyBoletos.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4">Carregando boletos...</td></tr>`;
    const clienteFiltro = selectFiltroUnidade.value;
    const url = clienteFiltro
      ? `${baseURL}/boletoscontroller?condominioid=${condominioId}&clienteid=${clienteFiltro}`
      : `${baseURL}/boletoscontroller?condominioid=${condominioId}`;
    const res = await fetch(url);
    const boletos = await res.json();
    renderBoletos(Array.isArray(boletos) ? boletos : []);
  } catch (err) {
    console.error(err);
    tbodyBoletos.innerHTML = `<tr><td colspan="6" class="text-center text-danger py-4">Erro ao carregar boletos.</td></tr>`;
  }
}

function renderBoletos(boletos) {
  if (!boletos.length) {
    tbodyBoletos.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4">Nenhum boleto gerado ainda para este condomínio.</td></tr>`;
    return;
  }

  tbodyBoletos.innerHTML = "";
  boletos.forEach((b) => {
    const badgeClass = STATUS_BADGE[b.status] || "badge-light";
    const competencia = new Date(b.competencia).toLocaleDateString("pt-BR", { month: "2-digit", year: "numeric" });

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${escapeHtml(b.Cliente?.apartamento)} - ${escapeHtml(b.Cliente?.nome)}</td>
      <td>${competencia}</td>
      <td>${formatarData(b.vencimento)}</td>
      <td>${formatarMoeda(b.valorTotal)}</td>
      <td><span class="badge ${badgeClass}">${escapeHtml(b.status)}</span></td>
      <td>
        <div class="paiva-actions">
          ${b.nossoNumero ? `<button class="btn btn-sm btn-light paiva-btn-light" data-action="sincronizar" data-id="${b.boletoid}" title="Sincronizar com o Santander"><i class="fas fa-sync"></i></button>` : ""}
          <button class="btn btn-sm btn-light paiva-btn-light" data-action="historico" data-id="${b.boletoid}" title="Ver histórico"><i class="fas fa-history"></i></button>
          ${b.status !== "PAGO" && b.status !== "CANCELADO" ? `<button class="btn btn-sm btn-outline-danger" data-action="cancelar" data-id="${b.boletoid}" title="Cancelar boleto"><i class="fas fa-ban"></i></button>` : ""}
        </div>
      </td>
    `;
    tbodyBoletos.appendChild(tr);
  });
}

const STATUS_LABEL = {
  PENDENTE: "Pendente (aguardando o banco)",
  REGISTRADO: "Registrado no Santander",
  PAGO: "Pago",
  VENCIDO: "Vencido",
  CANCELADO: "Cancelado",
  ERRO: "Erro ao registrar",
};

const ORIGEM_LABEL = {
  geracao: "Geração do boleto",
  webhook_santander: "Confirmação do Santander",
  sincronizacao_manual: "Sincronização manual",
  admin: "Ação do administrador",
};

const painelHistorico = document.querySelector("#painelHistorico");

tbodyBoletos.addEventListener("click", async (e) => {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;

  const action = btn.getAttribute("data-action");
  const id = btn.getAttribute("data-id");
  const condominioId = condominioSelecionado();

  try {
    if (action === "historico") {
      painelHistorico.innerHTML = `<div class="text-muted">Carregando histórico...</div>`;
      painelHistorico.scrollIntoView({ behavior: "smooth", block: "nearest" });

      const res = await fetch(`${baseURL}/boletoscontroller/${id}`);
      const boleto = await res.json();

      const linhas = (boleto.Historico || []).map((h) => {
        const quando = new Date(h.criadoEm).toLocaleString("pt-BR");
        const origem = ORIGEM_LABEL[h.origem] || h.origem;
        const de = h.statusAnterior ? (STATUS_LABEL[h.statusAnterior] || h.statusAnterior) : "—";
        const para = STATUS_LABEL[h.statusNovo] || h.statusNovo;
        return `<li><strong>${quando}</strong> — ${de} → <strong>${para}</strong> <span class="text-muted">(${origem})</span></li>`;
      }).join("");

      painelHistorico.innerHTML = `
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <strong>Histórico - Apto ${escapeHtml(boleto.Cliente?.apartamento)} - ${escapeHtml(boleto.Cliente?.nome)}</strong>
            <button class="btn btn-sm btn-light" id="btnFecharHistorico"><i class="fas fa-times"></i></button>
          </div>
          <div class="card-body">
            <ul class="pl-3 mb-0">${linhas || "<li>Nenhum evento registrado ainda.</li>"}</ul>
          </div>
        </div>
      `;

      document.querySelector("#btnFecharHistorico")?.addEventListener("click", () => {
        painelHistorico.innerHTML = "";
      });
      return;
    }

    if (action === "sincronizar") {
      const res = await fetch(`${baseURL}/boletoscontroller/${id}/sincronizar`);
      if (res.ok) {
        showToast({ type: "info", title: "Sincronizado", message: "Situação do boleto atualizada com o Santander." });
      } else {
        showToast({ type: "error", title: "Erro", message: "Não consegui sincronizar com o Santander agora." });
      }
    }

    if (action === "cancelar") {
      if (!confirm("Tem certeza que quer cancelar este boleto? Essa ação avisa o Santander pra baixar o título.")) return;
      const res = await fetch(`${baseURL}/boletoscontroller/${id}`, { method: "DELETE" });
      if (res.ok) {
        showToast({ type: "success", title: "Boleto cancelado", message: "O boleto foi baixado." });
      } else {
        const erro = await res.json().catch(() => ({}));
        showToast({ type: "error", title: "Erro ao cancelar", message: erro.error || "Não foi possível cancelar." });
      }
    }

    carregarBoletos(condominioId);
  } catch (err) {
    console.error(err);
    showToast({ type: "error", title: "Falha de conexão", message: "Verifique a internet / API e tente novamente." });
  }
});

btnAtualizarBoletos.addEventListener("click", () => {
  const id = condominioSelecionado();
  if (!id) {
    showToast({ type: "warn", title: "Atenção", message: "Selecione um condomínio primeiro." });
    return;
  }
  carregarBoletos(id);
});

selectFiltroUnidade.addEventListener("change", () => {
  const id = condominioSelecionado();
  if (!id) return;
  carregarBoletos(id);
});

// init
carregarCondominios();
