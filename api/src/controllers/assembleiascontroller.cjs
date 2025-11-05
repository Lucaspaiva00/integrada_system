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

    // Normaliza a saída para o front
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

// 📤 Criar assembleia com upload de documento
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

    const responseObj = {
      assembleiaid: novaAssembleia.assembleiaid,
      descricao: novaAssembleia.descricao,
      documento: novaAssembleia.documento,
      documentoUrl: novaAssembleia.documento,
      CondominioID: Number(novaAssembleia.CondominioID),
      nomeCondominio: novaAssembleia.Condominio?.nomecondominio || null,
      status: novaAssembleia.status || "Ativa",
    };

    res.status(201).json(responseObj);
  } catch (error) {
    console.error("Erro ao criar assembleia:", error);
    res.status(500).json({ error: "Erro ao criar assembleia" });
  }
};

const remove = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("ID recebido para exclusão:", id);

    if (!id) {
      return res.status(400).json({ error: "ID não informado." });
    }

    const prestacao = await prisma.comunicados.delete({
      where: { comunicadosid: Number(id) },
    });

    return res.status(200).json({
      message: "Excluído com sucesso.",
      prestacao,
    });
  } catch (err) {
    console.error("Erro ao excluir:", err);
    return res
      .status(500)
      .json({ message: "Erro ao excluir", prestacao: null });
  }
};

module.exports = {
  read,
  create,
  delete: remove,
};
