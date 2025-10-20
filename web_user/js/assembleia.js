const assembleiasCards = document.querySelector("#assembleiasCards");

async function listarAssembleias() {
    try {
        const res = await fetch("http://localhost:3000/assembleiascontroller");
        const dados = await res.json();

        assembleiasCards.innerHTML = ""; // limpa os cards

        dados.forEach(item => {
            const card = document.createElement("div");
            card.classList.add("card");

            card.innerHTML = `
                <i class="fas fa-users"></i>
                <div>
                    <p><strong>${item.descricao || "—"}</strong></p>
                    <p>${item.Condominio?.nomecondominio || "—"}</p>
                    <p>Status: ${item.status || "Ativa"}</p>
                </div>
            `;

            assembleiasCards.appendChild(card);
        });
    } catch (error) {
        console.error("Erro ao listar assembleias:", error);
        alert("Erro ao carregar assembleias.");
    }
}

listarAssembleias();
