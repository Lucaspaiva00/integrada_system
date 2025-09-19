const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const read = async (req, res) => {
    const prestacaocontas = await prisma.prestacaocontas.findMany();
    return res.json(prestacaocontas)
}

const create = async (req, res) => {
    const data = req.body
    let prestacaocontas = await prisma.prestacaocontas.create({
        data: data
    })
    return res.status(201).json(prestacaocontas).end();
}

const del = async (req, res)=>{
    let prestacaocontas = await prisma.prestacaocontas.delete({
        where:{
            id: parseInt(req.params.id)
        }
    });
    return res.status(204).json(prestacaocontas).end();
}

module.exports = {
    read,
    create,
    del
}