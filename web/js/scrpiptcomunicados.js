const caixaForms = document.querySelector("#caixaForms")
const uri = "http://localhost:3000/comunicadoscontroller"

caixaForms.addEventListener('submit', (e) => {
    e.preventDefault()
    const data = {
        datacomunicado: caixaForms.datacomunicado.value,
        descricao: caixaForms.descricao.value
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
                alert("Erro ao inserir um Comunicado")
            }
        })
})

fetch(uri)
    .then(resp => resp.json())
    .then(resp => {
        resp.forEach(e => {
            comunicado.innerHTML += `
            <td>${e.datacomunicado}</td>
            <td>${e.descricao}</td>
            <td>                
            <button type="button" title="button" class='btn btn-primary' id='editaroperacao' onClick='editaroperacao(this)'>Editar</button>
            </td>
            `

        })
    })