(() => {
  const api = "https://integrada-api.onrender.com/admin";
  const key = "integrada.boletos.admin";
  const $ = (id) => document.getElementById(id);
  const login = $("login");
  const manager = $("manager");
  const condo = $("condominio");
  const owner = $("proprietario");
  const feedback = $("feedback");
  const replacement = $("replacement");
  let token = sessionStorage.getItem(key);
  let replacementId;
  let listRequest = 0;
  let ownerRequest = 0;
  let owners = [];

  function showLogin() {
    token = null;
    sessionStorage.removeItem(key);
    hideCode();
    $("documents").replaceChildren();
    manager.hidden = true;
    login.hidden = false;
  }

  async function request(path, options = {}, pdf = false) {
    const res = await fetch(api + path, {
      ...options,
      cache: "no-store",
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers },
    });
    if (res.status === 401 && path !== "/login") showLogin();
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.error || "Não foi possível concluir. Tente novamente.");
    }
    return pdf ? res.blob() : res.status === 204 ? null : res.json();
  }

  async function run(action, button) {
    feedback.textContent = "";
    if (button) button.disabled = true;
    try {
      await action();
    } catch (error) {
      feedback.textContent = error.message;
    } finally {
      if (button) button.disabled = false;
    }
  }

  function hideCode() {
    $("code").value = "";
    $("code-result").hidden = true;
  }

  function updateCodeButton() {
    const selected = owners.find((item) => String(item.clienteid) === owner.value);
    const button = $("issue-code");
    button.disabled = !selected;
    button.textContent = selected?.temCodigo ? "Renovar código de acesso" : "Gerar código de acesso";
  }

  function formWithPDF(file) {
    if (!file || file.size > 4 * 1024 * 1024) throw new Error("Anexe um PDF de até 4 MB.");
    const data = new FormData();
    data.set("pdf", file);
    return data;
  }

  async function openDocument(item, download) {
    const preview = download ? null : window.open("about:blank", "_blank");
    if (!download && !preview) throw new Error("Permita a abertura de uma nova aba ou use Baixar.");
    if (preview) preview.opener = null;
    try {
      const blob = await request(`/boletos/${item.id}?download=${Number(download)}`, {}, true);
      const url = URL.createObjectURL(blob);
      if (preview) preview.location.replace(url);
      else {
        const link = document.createElement("a");
        link.href = url;
        link.download = `boleto-${item.competencia.slice(0, 7)}-${item.id}.pdf`;
        link.click();
      }
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (error) {
      preview?.close();
      throw error;
    }
  }

  function renderRow(item) {
    const tr = document.createElement("tr");
    tr.insertCell().textContent = new Date(item.competencia).toLocaleDateString("pt-BR", {
      month: "long", year: "numeric", timeZone: "UTC",
    });
    tr.insertCell().textContent = `${item.Cliente.nome} · ${item.Cliente.apartamento}`;
    const actions = tr.insertCell();
    const buttons = [
      ["Visualizar", () => openDocument(item, false)],
      ["Baixar", () => openDocument(item, true)],
      ["Substituir", () => {
        replacementId = item.id;
        replacement.value = "";
        replacement.click();
      }],
      ["Excluir", async () => {
        if (!confirm("Excluir este PDF do portal do proprietário?")) return;
        await request(`/boletos/${item.id}`, { method: "DELETE" });
        await loadList();
        feedback.textContent = "PDF excluído.";
      }],
    ];
    for (const [label, action] of buttons) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "btn btn-sm btn-outline-primary mr-1 mb-1";
      button.textContent = label;
      button.onclick = () => run(action, button);
      actions.append(button);
    }
    return tr;
  }

  async function loadList() {
    const seq = ++listRequest;
    $("records").hidden = true;
    $("documents").replaceChildren();
    $("empty").textContent = condo.value ? "Carregando PDFs…" : "Selecione um condomínio.";
    if (!condo.value) return;
    const query = new URLSearchParams({ condominioid: condo.value, clienteid: owner.value });
    const rows = await request(`/boletos?${query}`);
    if (seq !== listRequest || !token) return;
    $("empty").textContent = rows.length ? "" : "Nenhum PDF disponibilizado.";
    $("records").hidden = !rows.length;
    $("documents").replaceChildren(...rows.map(renderRow));
  }

  async function selectCondo() {
    const seq = ++ownerRequest;
    hideCode();
    owner.disabled = true;
    owners = [];
    owner.replaceChildren(new Option("Selecione o proprietário", ""));
    updateCodeButton();
    await Promise.all([
      loadList(),
      (async () => {
        if (!condo.value) return;
        const result = await request(`/boletos/condominios/${condo.value}/proprietarios`);
        if (seq !== ownerRequest || !token) return;
        owners = result;
        owner.append(...owners.map((item) => new Option(`${item.nome} · ${item.apartamento}`, item.clienteid)));
        owner.disabled = false;
      })(),
    ]);
  }

  async function enter() {
    const condos = await request("/boletos/condominios");
    condo.replaceChildren(new Option("Selecione o condomínio", ""), ...condos.map(
      (item) => new Option(item.nomecondominio, item.condominioid),
    ));
    await selectCondo();
    login.hidden = true;
    manager.hidden = false;
  }

  login.onsubmit = (event) => {
    event.preventDefault();
    run(async () => {
      const result = await request("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: $("senha").value }),
      });
      login.reset();
      token = result.token;
      sessionStorage.setItem(key, token);
      await enter();
    }, event.submitter);
  };
  condo.onchange = () => run(selectCondo);
  owner.onchange = () => {
    hideCode();
    updateCodeButton();
    run(loadList);
  };
  $("exit-module").onclick = () => sessionStorage.removeItem(key);
  $("signout").onclick = () => {
    feedback.textContent = "";
    showLogin();
  };
  $("issue-code").onclick = () => run(async () => {
    const selected = owners.find((item) => String(item.clienteid) === owner.value);
    if (!selected) return;
    const condoId = condo.value;
    const ownerId = owner.value;
    if (selected.temCodigo && !confirm("O código anterior deixará de funcionar. Renovar?")) return;
    const result = await request(`/boletos/condominios/${condoId}/proprietarios/${ownerId}/codigo`, { method: "POST" });
    selected.temCodigo = true;
    if (condo.value === condoId && owner.value === ownerId && token) {
      $("code").value = result.codigo;
      $("code-result").hidden = false;
    }
  }, $("issue-code")).finally(updateCodeButton);
  $("attach").onsubmit = (event) => {
    event.preventDefault();
    run(async () => {
      const data = formWithPDF($("pdf").files[0]);
      data.set("condominioid", condo.value);
      data.set("clienteid", owner.value);
      data.set("competencia", $("competencia").value);
      await request("/boletos", { method: "POST", body: data });
      $("pdf").value = "";
      await loadList();
      feedback.textContent = "Boleto disponibilizado para o proprietário.";
    }, $("publish"));
  };
  replacement.onchange = () => {
    if (!replacement.files.length) return;
    run(async () => {
      await request(`/boletos/${replacementId}`, { method: "PUT", body: formWithPDF(replacement.files[0]) });
      await loadList();
      feedback.textContent = "PDF substituído.";
    });
  };

  if (token) run(enter);
  else showLogin();
})();
