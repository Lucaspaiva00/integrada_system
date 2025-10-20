const caixaForms = document.querySelector("#caixaForms");
const selectCondominio = document.querySelector("#condominioSelect");
const tbodyAssembleia = document.querySelector("#assembleia");

const uriCondominios = "http://localhost:3000/condominiocontroller";
const uriAssembleias = "http://localhost:3000/assembleiascontroller";

// Carregar condomínios no select
async function carregarCondominios() {
    try {
        const res = await fetch(uriCondominios);
        const dados = await res.json();

        selectCondominio.innerHTML = `<option value="">Selecione o condomínio</option>`;

        dados.forEach(cond => {
            const option = document.createElement("option");
            option.value = cond.condominioid;
            option.textContent = cond.nomecondominio;
            selectCondominio.appendChild(option);
        });
    } catch (error) {
        console.error("Erro ao carregar condomínios:", error);
        alert("Erro ao carregar lista de condomínios.");
    }
}

// Listar assembleias na tabela
async function listarAssembleias() {
    try {
        const res = await fetch(uriAssembleias);
        const dados = await res.json();

        tbodyAssembleia.innerHTML = ""; // limpa tabela

        dados.forEach(item => {
            const tr = document.createElement("tr");

            tr.innerHTML = `
                <td>${item.descricao}</td>
                <td>${item.Condominio?.nomecondominio || "—"}</td>
                <td>${item.status || "Ativa"}</td>
            `;

            tbodyAssembleia.appendChild(tr);
        });
    } catch (error) {
        console.error("Erro ao listar assembleias:", error);
        alert("Erro ao carregar assembleias.");
    }
}

// Enviar formulário
caixaForms.addEventListener('submit', async (e) => {
    e.preventDefault();

    const data = {
        descricao: caixaForms.descricao.value,
        CondominioID: parseInt(selectCondominio.value)
    };

    try {
        const res = await fetch(uriAssembleias, {
            method: "POST",
            headers: { 'Content-Type': "application/json" },
            body: JSON.stringify(data)
        });

        if (res.status === 201) {
            alert("Assembleia cadastrada com sucesso!");
            caixaForms.reset();
            listarAssembleias(); // atualiza a tabela
        } else {
            alert("Erro ao cadastrar assembleia!");
        }
    } catch (error) {
        console.error("Erro ao enviar assembleia:", error);
        alert("Falha ao enviar assembleia.");
    }
});

// Inicialização
carregarCondominios();
listarAssembleias();
