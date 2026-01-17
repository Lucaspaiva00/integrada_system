const prisma = require("../../prisma/connection.cjs");

// 📋 Listar assembleias
const read = async (req, res) => {
  try {
    const assembleiasRaw = await prisma.assembleia.findMany({
      include: {
        Condominio: { select: { nomecondominio: true } },
      },
      orderBy: { assembleiaid: "desc" },
    });

    const assembleias = assembleiasRaw.map((a) => ({
      assembleiaid: a.assembleiaid,
      descricao: a.descricao,
      documento: a.documento,
      documentoUrl: a.documento,
      CondominioID: Number(a.CondominioID),
      nomeCondominio: a.Condominio?.nomecondominio || null,
      status: a.status || "Ativa",
    }));

    res.json(assembleias);
  } catch (error) {
    console.error("Erro ao listar assembleias:", error);
    res.status(500).json({ error: "Erro ao listar assembleias" });
  }
};

// 📤 Criar assembleia
const create = async (req, res) => {
  try {
    const { descricao, CondominioID, documentoUrl } = req.body;

    if (!descricao || !CondominioID || !documentoUrl) {
      return res
        .status(400)
        .json({ error: "Descrição e condomínio são obrigatórios." });
    }

    const novaAssembleia = await prisma.assembleia.create({
      data: {
        descricao,
        documento: documentoUrl,
        Condominio: { connect: { condominioid: Number(CondominioID) } },
      },
      include: {
        Condominio: { select: { nomecondominio: true } },
      },
    });

    return res.status(201).json({
      assembleiaid: novaAssembleia.assembleiaid,
      descricao: novaAssembleia.descricao,
      documento: novaAssembleia.documento,
      documentoUrl: novaAssembleia.documento,
      CondominioID: Number(novaAssembleia.CondominioID),
      nomeCondominio: novaAssembleia.Condominio?.nomecondominio || null,
      status: novaAssembleia.status || "Ativa",
    });
  } catch (error) {
    console.error("Erro ao criar assembleia:", error);
    res.status(500).json({ error: "Erro ao criar assembleia" });
  }
};

// 🗑️ Excluir assembleia
const remove = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("ID recebido para exclusão:", id);

    if (!id) {
      return res.status(400).json({ error: "ID não informado." });
    }

    const assembleia = await prisma.assembleia.delete({
      where: { assembleiaid: Number(id) },
    });

    return res.status(200).json({
      message: "Excluído com sucesso.",
      assembleia,
    });
  } catch (err) {
    console.error("Erro ao excluir assembleia:", err);
    return res.status(500).json({
      message: "Erro ao excluir",
      assembleia: null,
    });
  }
};

module.exports = {
  read,
  create,
  delete: remove,
};
