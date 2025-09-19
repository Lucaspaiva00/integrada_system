const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const read = async (req, res) => {
    const assembleia = await prisma.assembleia.findMany();
    return res.json(assembleia)
}

const create = async (req, res) => {
    const data = req.body
    let assembleia = await prisma.assembleia.create({
        data: data
    })
    return res.status(201).json(assembleia).end();
}

const del = async (req, res)=>{
    let assembleia = await prisma.assembleia.delete({
        where:{
            id: parseInt(req.params.id)
        }
    });
    return res.status(204).json(assembleia).end();
}

module.exports = {
    read,
    create,
    del
}