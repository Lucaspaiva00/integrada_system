(() => {
  const form = document.getElementById("admin-login");
  const password = document.getElementById("password");
  const status = document.getElementById("status");
  form.onsubmit = async (event) => {
    event.preventDefault();
    const button = event.submitter || form.querySelector("button");
    button.disabled = true;
    status.textContent = "";
    try {
      const res = await fetch("https://integrada-api.onrender.com/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: password.value }),
      });
      const data = await res.json();
      if (!res.ok || !data.token) {
        throw new Error(data.error || "Não foi possível entrar no painel.");
      }
      window.IntegradaAdmin.save(data.token);
      form.reset();
      location.replace(window.IntegradaAdmin.destination());
    } catch (error) {
      status.textContent = error instanceof TypeError ? "Confira sua conexão e tente novamente." : error.message;
    } finally {
      button.disabled = false;
    }
  };
})();
