const caixaForms = document.querySelector("#caixaForms")
const uri = "http://localhost:3000/clientescontroller"

caixaForms.addEventListener('submit', (e) => {
    e.preventDefault()
    const data = {
        apartamento: caixaForms.apartamento.value,
        nome: caixaForms.nome.value,
        cpf: caixaForms.cpf.value,
        CondominioID: Number(caixaForms.CondominioID.value)
    }
    fetch(`${uri}`, {
        method: "POST",
        headers: {
            'Content-Type': "application/json"
        },
        body: JSON.stringify(data)
    })
        .then(res => res.status)
        .then(status => {
            if (status == 201) {
                window.location.reload()
            } else {
                alert("Erro ao inserir um Condomínio")
            }
        })
})

const cardsContainer = document.querySelector("#cardsContainer")

function carregarCondominos() {
    fetch(uri)
        .then(res => res.json())
        .then(dados => {
            cardsContainer.innerHTML = ""

            const row = document.createElement("div")
            row.classList.add("row", "g-3")

            dados.forEach(cliente => {
                const card = document.createElement("div")
                card.classList.add("card", "shadow-sm")

                card.innerHTML = `
        <div class="card-body">
            <h5 class="card-title">${cliente.nome}</h5>
            <p class="card-text"><strong>Apartamento:</strong> ${cliente.apartamento}</p>
            <p class="card-text"><strong>CPF:</strong> ${cliente.cpf}</p>
            <p class="card-text"><strong>Condomínio ID:</strong> ${cliente.CondominioID}</p>
            <div class="d-flex justify-content-end gap-2 mt-3">
                <button class="btn btn-sm btn-primary" onclick="editarCliente(${cliente.id})">Editar</button>
            </div>
        </div>
    `

                cardsContainer.appendChild(card)
            })


            cardsContainer.appendChild(row)
        })
        .catch(err => console.error("Erro ao carregar condôminos:", err))
}


document.addEventListener("DOMContentLoaded", carregarCondominos)

function deletarCliente(id) {
    if (confirm("Tem certeza que deseja excluir este condômino?")) {
        fetch(`${uri}/${id}`, {
            method: "DELETE"
        })
            .then(res => {
                if (res.ok) {
                    carregarCondominos()
                } else {
                    alert("Erro ao deletar condômino.")
                }
            })
    }
}

