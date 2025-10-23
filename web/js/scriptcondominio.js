const caixaForms = document.querySelector("#caixaForms")
const uri = "http://localhost:3000/condominiocontroller"

caixaForms.addEventListener('submit', (e) => {
    e.preventDefault()
    const data = {
        nomecondominio: caixaForms.nomecondominio.value,
        endereco: caixaForms.endereco.value,
        telefone: caixaForms.telefone.value
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
            }else{
                alert("Erro ao inserir um Condomínio")
            }
        })
})


fetch(uri)
    .then(resp => resp.json())
    .then(resp => {
        resp.forEach(e => {
            cliente.innerHTML += `
            <td>${e.nomecondominio}</td>
            <td>${e.endereco}</td>
            <td>${e.telefone}</td>
            
            `

        })
    })