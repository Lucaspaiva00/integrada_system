const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const loginInquilino = async (req, res) => {
    const { cpf, email } = req.body;

    if (!cpf || !email) {
        return res.status(400).json({ error: "CPF e e-mail são obrigatórios." });
    }

    try {
        const inquilino = await prisma.inquilinos.findFirst({
            where: {
                cpf: cpf,
                email: email
            },
            include: {
                Cliente: true, // traz informações do proprietário
                Condominio: true
            }
        });

        if (!inquilino) {
            return res.status(401).json({ error: "Credenciais inválidas." });
        }

        // aqui futuramente dá pra gerar um JWT
        return res.status(200).json({
            message: "Login realizado com sucesso!",
            inquilino
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Erro no servidor." });
    }
};

module.exports = { loginInquilino };
