const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const read = async (req, res) => {
    const condominio = await prisma.condominio.findMany();
    return res.json(condominio)
}

const create = async (req, res) => {
    const data = req.body
    let condominio = await prisma.condominio.create({
        data: data
    })
    return res.status(201).json(condominio).end();
}

const del = async (req, res)=>{
    let condominio = await prisma.condominio.delete({
        where:{
            id: parseInt(req.params.id)
        }
    });
    return res.status(204).json(condominio).end();
}

module.exports = {
    read,
    create,
    del
}