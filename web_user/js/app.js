(() => {
  "use strict";
  const API = "https://integrada-api.onrender.com";
  const page = document.body.dataset.page;
  const app = document.querySelector("#app");
  const paths = {
    home: "index.html",
    boletos: "boleto.html",
    comunicados: "comunicados.html",
    prestacoes: "prestacaocontas.html",
    assembleias: "assembleias.html",
  };
  const titles = {
    home: "Visão geral",
    boletos: "Meus boletos",
    comunicados: "Comunicados",
    prestacoes: "Prestação de contas",
    assembleias: "Assembleias",
  };
  const descriptions = {
    boletos: "Consulte suas cobranças e acompanhe os pagamentos.",
    comunicados: "Fique por dentro dos avisos da administradora.",
    prestacoes: "Transparência na gestão do seu condomínio.",
    assembleias: "Acompanhe as assembleias e seus documentos.",
  };
  const shapes = {
    home: "M3 10 12 3l9 7M5 9v12h14V9M9 21v-8h6v8",
    boletos: "M6 3h12v18l-3-2-3 2-3-2-3 2V3M9 7h6M9 11h6",
    comunicados: "M4 10v5h4l10 5V5L8 10H4M8 15l2 6M21 9v7",
    prestacoes: "M4 21V3h16v18H4M8 16v-3M12 16V8M16 16v-5",
    assembleias:
      "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M16 4a4 4 0 0 1 0 8M22 21v-2a4 4 0 0 0-3-3M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0",
    menu: "M4 6h16M4 12h16M4 18h16",
    close: "M6 6l12 12M18 6 6 18",
    arrow: "m9 5 7 7-7 7",
    refresh: "M20 7v5h-5M4 17v-5h5M6 6a8 8 0 0 1 13 3M18 18A8 8 0 0 1 5 15",
    logout: "M9 4H4v16h5M12 12h9m-4-4 4 4-4 4",
    building: "M4 21V5h10v16M14 10h6v11M8 9h2M8 13h2M8 17h2M2 21h20",
  };
  const icon = (name) =>
    `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${shapes[name] || shapes.boletos}"/></svg>`;
  const esc = (value) =>
    String(value ?? "").replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  const brand = `<div class="brand"><span class="brand-mark">${icon("building")}</span><div>INTEGRADA<small>GESTÃO DE CONDOMÍNIOS</small></div></div>`;
  let token = sessionStorage.getItem("integrada.token");
  function logout() {
    sessionStorage.removeItem("integrada.token");
    localStorage.removeItem("inquilino");
    location.replace("login_inquilino.html");
  }
  function toast(message) {
    const el = document.querySelector("#toast");
    el.textContent = message;
    el.style.display = "block";
    setTimeout(() => (el.style.display = "none"), 3000);
  }
  async function request(path, options = {}) {
    const abort = new AbortController();
    const timer = setTimeout(() => abort.abort(), 45000);
    try {
      const res = await fetch(API + path, {
        ...options,
        signal: abort.signal,
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...options.headers,
        },
      });
      const data = await res.json();
      if (res.status === 401 && page !== "login") {
        logout();
        throw new Error("Sua sessão expirou.");
      }
      if (!res.ok)
        throw new Error(data.error || "Não foi possível carregar os dados.");
      return data;
    } catch (error) {
      if (error.name === "AbortError")
        throw new Error("O servidor demorou para responder. Tente novamente.");
      if (error instanceof TypeError)
        throw new Error("Sem conexão com o servidor. Verifique sua internet.");
      throw error;
    } finally {
      clearTimeout(timer);
    }
  }
  function date(value, month = false) {
    if (!value) return "Não informado";
    const d = new Date(value);
    return Number.isNaN(d.getTime())
      ? String(value)
      : d.toLocaleDateString(
          "pt-BR",
          month
            ? { month: "long", year: "numeric", timeZone: "UTC" }
            : { timeZone: "UTC" },
        );
  }
  const money = (value) =>
    value == null
      ? "Não informado"
      : Number(value).toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        });
  function safeURL(value) {
    try {
      const url = new URL(value, API);
      return url.protocol === "https:" && !url.username && !url.password
        ? url.href
        : null;
    } catch {
      return null;
    }
  }
  function documentLink(value) {
    const url = value && safeURL(value);
    return url
      ? `<a class="button secondary document" href="${esc(url)}" target="_blank" rel="noopener noreferrer" data-document>${icon("boletos")} Abrir documento</a>`
      : '<p class="muted">Nenhum documento disponibilizado.</p>';
  }
  function empty(message) {
    return `<div class="card empty"><div class="icon-box">${icon(page)}</div><h2>Nenhum registro disponível</h2><p>${esc(message)}</p></div>`;
  }
  function copyBox(value, label) {
    return value
      ? `<div class="copy-box"><code>${esc(value)}</code><button class="button secondary" data-copy="${esc(value)}">${esc(label)}</button></div>`
      : "";
  }
  function boleto(b) {
    return `<article class="card"><div class="card-head"><div><div class="eyebrow">Competência</div><h2 style="margin-top:8px">${esc(date(b.competencia, true))}</h2></div><span class="badge ${esc(b.status)}">${esc(b.status)}</span></div><div class="amount">${esc(money(b.valorTotal))}</div><div class="facts"><div><small>Vencimento</small><strong>${esc(date(b.vencimento))}</strong></div>${b.dataPagamento ? `<div><small>Pagamento</small><strong>${esc(date(b.dataPagamento))}</strong></div>` : ""}${b.valorPago != null ? `<div><small>Valor pago</small><strong>${esc(money(b.valorPago))}</strong></div>` : ""}</div>${copyBox(b.linhaDigitavel, "Copiar linha digitável")}${!b.linhaDigitavel && b.codigoBarras ? copyBox(b.codigoBarras, "Copiar código de barras") : ""}${copyBox(b.qrCodePix, "Copiar código Pix")}${!b.linhaDigitavel && b.status === "PENDENTE" ? "<p>Aguardando confirmação do banco.</p>" : ""}${b.Itens?.length ? `<details><summary>Ver composição do boleto</summary>${b.Itens.map((i) => `<div class="item-row"><span>${esc(i.descricao)}</span><strong>${esc(money(i.valorTotal))}</strong></div>`).join("")}</details>` : ""}</article>`;
  }
  function record(item) {
    return `<article class="card"><div class="card-head"><div class="icon-box">${icon(page)}</div>${item.datacomunicado ? `<span class="badge">${esc(date(item.datacomunicado))}</span>` : ""}</div><h2>${page === "prestacoes" ? esc(date(item.mes, true)) : page === "assembleias" ? "Assembleia" : "Comunicado"}</h2>${item.descricao ? `<p>${esc(item.descricao)}</p>` : ""}${documentLink(item.documentoUrl || item.documento)}</article>`;
  }
  function shell(user) {
    app.innerHTML = `<div class="overlay" id="overlay"></div><aside class="sidebar" id="sidebar" aria-label="Menu principal">${brand}<button class="close-menu" aria-label="Fechar menu">${icon("close")}</button><p class="eyebrow">Portal do proprietário</p><nav>${Object.keys(
      paths,
    )
      .map(
        (key) =>
          `<a class="nav-link ${page === key ? "active" : ""}" ${page === key ? 'aria-current="page"' : ""} href="${paths[key]}">${icon(key)}${titles[key]}</a>`,
      )
      .join(
        "",
      )}</nav><footer><button class="logout">${icon("logout")} Sair da conta</button><p>Integrada · Desenvolvido por Paiva Tech</p></footer></aside><div class="shell"><header class="topbar"><button class="menu-button" aria-label="Abrir menu" aria-controls="sidebar" aria-expanded="false">${icon("menu")}</button><div class="context"><small>Seu condomínio</small><strong>${esc(user.condominio?.nome || "Condomínio")}</strong></div><div class="account"><div class="name"><small>Proprietário</small><strong>${esc(user.nome)}</strong></div><div class="avatar" aria-hidden="true">${esc(user.nome?.[0]?.toUpperCase() || "P")}</div></div></header><div id="connection" class="offline" ${navigator.onLine ? "hidden" : ""} role="status">Você está sem internet. Conecte-se para atualizar os dados.</div><main class="main" id="content" tabindex="-1"><div class="page-title"><div><div class="eyebrow">Portal do proprietário</div><h1>${titles[page]}</h1><p>${descriptions[page] || "Tudo sobre o seu condomínio em um só lugar."}</p></div>${page !== "home" ? `<button class="button secondary" id="refresh" aria-label="Atualizar dados">${icon("refresh")}<span>Atualizar</span></button>` : ""}</div><div id="records" class="cards" aria-live="polite"></div></main></div>`;
    const sidebar = document.querySelector("#sidebar");
    const menu = document.querySelector(".menu-button");
    const overlay = document.querySelector("#overlay");
    function setMenu(open) {
      sidebar.classList.toggle("open", open);
      overlay.classList.toggle("open", open);
      menu.setAttribute("aria-expanded", String(open));
      document.body.style.overflow = open ? "hidden" : "";
      if (open) document.querySelector(".close-menu").focus();
      else menu.focus();
    }
    menu.onclick = () => setMenu(true);
    document.querySelector(".close-menu").onclick = () => setMenu(false);
    overlay.onclick = () => setMenu(false);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && sidebar.classList.contains("open"))
        setMenu(false);
      if (e.key === "Tab" && sidebar.classList.contains("open")) {
        const nodes = [...sidebar.querySelectorAll("button,a")];
        const first = nodes[0],
          last = nodes.at(-1);
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });
    document.querySelector(".logout").onclick = logout;
    document.querySelector("#refresh")?.addEventListener("click", load);
    window.addEventListener("online", () => {
      document.querySelector("#connection").hidden = true;
    });
    window.addEventListener("offline", () => {
      document.querySelector("#connection").hidden = false;
    });
    if (window.Capacitor?.isNativePlatform())
      window.Capacitor.Plugins.App?.addListener("backButton", () => {
        if (sidebar.classList.contains("open")) setMenu(false);
        else if (page !== "home") location.href = paths.home;
        else window.Capacitor.Plugins.App.exitApp();
      });
    if (page === "home") {
      document.querySelector("#records").className = "";
      document.querySelector("#records").innerHTML =
        `<section class="hero"><div><div class="eyebrow">Bem-vindo à Integrada</div><h2>Olá, ${esc(user.nome)}.</h2><p>Acompanhe seus boletos, avisos e documentos com praticidade e transparência.</p><a class="button" href="boleto.html">Acessar meus boletos ${icon("arrow")}</a></div><div class="unit"><small>Seu imóvel</small><strong>${esc(user.apartamento)}</strong><span class="muted">Proprietário</span></div></section><h2 class="section-title">O que você precisa hoje?</h2><div class="grid">${Object.keys(
          paths,
        )
          .filter((k) => k !== "home")
          .map(
            (k) =>
              `<a class="card quick" href="${paths[k]}"><div class="icon-box">${icon(k)}</div><div><h3>${titles[k]}</h3><p>${descriptions[k]}</p></div><span class="arrow">${icon("arrow")}</span></a>`,
          )
          .join("")}</div>`;
    } else load();
  }
  async function load() {
    const list = document.querySelector("#records");
    const button = document.querySelector("#refresh");
    button.disabled = true;
    list.innerHTML =
      '<div class="loading" role="status">Carregando dados do condomínio…</div>';
    try {
      const data = await request(`/portal/${page}`);
      if (!Array.isArray(data))
        throw new Error("Resposta inválida do servidor.");
      list.innerHTML = data.length
        ? data.map(page === "boletos" ? boleto : record).join("")
        : empty(
            page === "boletos"
              ? "Nenhum boleto foi disponibilizado para sua unidade."
              : "A administradora ainda não disponibilizou registros para seu condomínio.",
          );
    } catch (error) {
      list.innerHTML = `<div class="card empty"><h2>Não foi possível carregar</h2><p>${esc(error.message)}</p><button class="button" id="retry">Tentar novamente</button></div>`;
      document.querySelector("#retry").onclick = load;
    } finally {
      button.disabled = false;
    }
  }
  function login() {
    document.body.classList.add("login-body");
    app.style.width = "100%";
    app.innerHTML = `<main class="login-layout" id="content" style="margin:auto"><section class="login-intro">${brand}<h1>Seu condomínio.<br>Mais perto de você.</h1><p>Boletos, comunicados e documentos.<br>Gestão transparente, acesso simples.</p></section><section><div class="login-card"><div class="eyebrow">Portal do proprietário</div><h2>Bem-vindo à Integrada</h2><p class="muted">Acesse as informações do seu condomínio.</p><form id="loginForm"><label for="apartamento">Imóvel / apartamento</label><input id="apartamento" name="apartamento" placeholder="Informe seu imóvel" autocomplete="username" maxlength="100" required><label for="cpf">Últimos 4 dígitos do CPF</label><input id="cpf" name="cpf" type="password" inputmode="numeric" pattern="[0-9]{4}" minlength="4" maxlength="4" placeholder="••••" autocomplete="current-password" required><button class="button" type="submit">Entrar ${icon("arrow")}</button><p class="error" id="msg" role="alert"></p></form><p class="privacy">Use os dados cadastrados pela administradora. Precisa de ajuda para acessar? Entre em contato com a Integrada.</p></div><p class="login-footer">Integrada · Desenvolvido por Paiva Tech</p></section></main>`;
    document.querySelector("#loginForm").onsubmit = async (e) => {
      e.preventDefault();
      const form = e.currentTarget;
      const button = form.querySelector("button");
      const msg = document.querySelector("#msg");
      button.disabled = true;
      button.textContent = "Entrando…";
      msg.textContent = "";
      try {
        const data = await request("/login/proprietario", {
          method: "POST",
          body: JSON.stringify({
            apartamento: form.apartamento.value.trim(),
            cpf: form.cpf.value.trim(),
          }),
        });
        if (!data.token)
          throw new Error(
            "O acesso do aplicativo ainda não foi habilitado na API. Contate a administradora.",
          );
        sessionStorage.setItem("integrada.token", data.token);
        localStorage.removeItem("inquilino");
        location.replace("index.html");
      } catch (error) {
        msg.textContent = error.message;
      } finally {
        button.disabled = false;
        button.textContent = "Entrar";
      }
    };
  }
  document.addEventListener("click", async (e) => {
    const copy = e.target.closest("[data-copy]");
    if (copy) {
      try {
        if (window.Capacitor?.isNativePlatform())
          await window.Capacitor.Plugins.Clipboard.write({
            string: copy.dataset.copy,
          });
        else await navigator.clipboard.writeText(copy.dataset.copy);
        toast("Código copiado.");
      } catch {
        toast("Não foi possível copiar. Selecione o código acima.");
      }
    }
    const link = e.target.closest("[data-document]");
    if (link && window.Capacitor?.isNativePlatform()) {
      e.preventDefault();
      try {
        await window.Capacitor.Plugins.Browser.open({ url: link.href });
      } catch {
        toast("Não foi possível abrir o documento. Tente novamente.");
      }
    }
  });
  localStorage.removeItem("inquilino");
  if (page === "login") login();
  else if (!token) logout();
  else {
    app.innerHTML = '<div class="loading">Validando seu acesso…</div>';
    request("/portal/me")
      .then(shell)
      .catch((error) => {
        app.innerHTML = `<main class="card empty"><h1>Não foi possível conectar</h1><p>${esc(error.message)}</p><button class="button" id="reconnect">Tentar novamente</button><a class="button secondary" href="login_inquilino.html">Voltar ao login</a></main>`;
        document.querySelector("#reconnect").onclick = () => location.reload();
      });
  }
})();
