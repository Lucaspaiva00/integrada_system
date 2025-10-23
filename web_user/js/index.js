// // Recupera o inquilino logado
// const inquilino = JSON.parse(localStorage.getItem("inquilino"));

// if (!inquilino) {
//     // Se não estiver logado, redireciona
//     window.location.href = "login_inquilino.html";
// } else {
//     // Mostra os dados do inquilino e condomínio
//     const nomeEl = document.querySelector("#nomeInquilino");
//     const condominioEl = document.querySelector("#nomeCondominio");

//     if (nomeEl && condominioEl) {
//         nomeEl.textContent = `👤 Inquilino: ${inquilino.nome}`;
//         condominioEl.textContent = `🏢 Condomínio: ${inquilino.Condominio?.nomecondominio || "Não informado"}`;
//     } else {
//         console.warn("Elementos #nomeInquilino ou #nomeCondominio não encontrados no HTML.");
//     }
// }
