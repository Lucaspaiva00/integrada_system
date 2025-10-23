const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const path = require('path');

// 📋 Listar comunicados (com o nome do condomínio)
const read = async (req, res) => {
  try {
    const comunicados = await prisma.comunicados.findMany({
      include: {
        Condominio: { select: { nomecondominio: true } }
      },
      orderBy: { comunicadosid: 'desc' }
    });
    res.json(comunicados);
  } catch (error) {
    console.error("Erro ao listar comunicados:", error);
    res.status(500).json({ error: "Erro ao listar comunicados" });
  }
};

// 📤 Criar comunicado com upload de documento
const create = async (req, res) => {
  try {
    const { datacomunicado, descricao, CondominioID } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: "Arquivo não enviado" });
    }

    const novoComunicado = await prisma.comunicados.create({
      data: {
        datacomunicado,
        descricao,
        documento: req.file.filename,
        Condominio: { connect: { condominioid: Number(CondominioID) } }
      },
      include: {
        Condominio: { select: { nomecondominio: true } }
      }
    });

    res.status(201).json(novoComunicado);
  } catch (error) {
    console.error("Erro ao criar comunicado:", error);
    res.status(500).json({ error: "Erro ao criar comunicado" });
  }
};

module.exports = { read, create };
