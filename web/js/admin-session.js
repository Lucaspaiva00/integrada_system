(() => {
  const key = "integrada.admin.session";
  const oldKey = "integrada.boletos.admin";
  const returnKey = "integrada.admin.return";
  const loginPage = document.currentScript.hasAttribute("data-login");
  const pagePath = /^\/(?:index|assembleias|boletos|comunicados|condominio|condomino|detalhes-condominio|inquilino|prestacaocontas)(?:\.html)?$/;

  function token() {
    const stored = localStorage.getItem(key);
    if (!stored || !/^\d{10}\.[\w-]{43}$/.test(stored)) return null;
    return Number(stored.split(".")[0]) > Date.now() / 1000 ? stored : null;
  }

  function save(value) {
    localStorage.setItem(key, value);
    sessionStorage.removeItem(oldKey);
  }

  function clear() {
    localStorage.removeItem(key);
    sessionStorage.removeItem(oldKey);
  }

  function redirect() {
    clear();
    sessionStorage.setItem(returnKey, location.pathname + location.search);
    location.replace("login.html");
  }

  function destination() {
    const path = sessionStorage.getItem(returnKey);
    sessionStorage.removeItem(returnKey);
    return path && pagePath.test(path.split("?")[0]) ? path : "index.html";
  }

  window.IntegradaAdmin = { token, save, redirect, destination };

  if (!token() && sessionStorage.getItem(oldKey)) save(sessionStorage.getItem(oldKey));
  if (loginPage) {
    if (token()) location.replace(destination());
    return;
  }

  if (!token()) redirect();
  document.addEventListener("click", (event) => {
    if (event.target.closest("[data-admin-logout]")) clear();
  });
  window.addEventListener("pageshow", () => {
    if (!token()) redirect();
  });
})();
