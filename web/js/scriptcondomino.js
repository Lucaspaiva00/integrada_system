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
