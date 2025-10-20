const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const read = async (req, res) => {
    const comunicados = await prisma.comunicados.findMany();
    return res.json(comunicados)
}

const create = async (req, res) => {
    const data = req.body
    let comunicados = await prisma.comunicados.create({
        data: data
    })
    return res.status(201).json(comunicados).end();
}

const del = async (req, res)=>{
    let comunicados = await prisma.comunicados.delete({
        where:{
            id: parseInt(req.params.id)
        }
    });
    return res.status(204).json(comunicados).end();
}

module.exports = {
    read,
    create,
    del
}