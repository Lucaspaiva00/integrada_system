const caixaForms = document.querySelector("#caixaForms")
const uri2 = "http://localhost:3000/assembleiascontroller"

caixaForms.addEventListener('submit', (e) => {
    e.preventDefault()
    const data = {
        descricao: caixaForms.descricao.value
    }
    fetch(`${uri2}`, {
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
            }else{
                alert("Erro ao inserir um Condomínio")
            }
        })
})
