const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const read = async (req, res) => {
    try {
        const assembleias = await prisma.assembleia.findMany({
            include: { Condominio: true } // incluir dados do condomínio
        });
        return res.json(assembleias);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Erro ao listar assembleias" });
    }
};


const create = async (req, res) => {
    try {
        const { descricao, CondominioID } = req.body;

        const assembleia = await prisma.assembleia.create({
            data: {
                descricao,
                CondominioID
            }
        });

        return res.status(201).json(assembleia);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Erro ao criar assembleia" });
    }
};

const del = async (req, res) => {
    let assembleia = await prisma.assembleia.delete({
        where: {
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