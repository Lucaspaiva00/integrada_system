const caixaForms = document.querySelector("#caixaForms");
const uri = "http://localhost:3000/comunicadoscontroller";

fetch(uri)
    .then(resp => resp.json())
    .then(resp => {
        resp.forEach(e => {
            caixaForms.innerHTML += `
            <div class="card">
                <h4>Data: ${e.datacomunicado}</h4>
                <p>Descrição: ${e.descricao}</p>
            </div>
            `;
        });
    });
