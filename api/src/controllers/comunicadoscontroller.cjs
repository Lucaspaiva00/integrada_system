const prisma = require("../../prisma/connection.cjs");

// Normaliza para o mesmo formato SEMPRE (read/create/update/readById)
function mapComunicado(c) {
  return {
    comunicadosid: c.comunicadosid,
    datacomunicado: c.datacomunicado,
    descricao: c.descricao,
    documento: c.documento,
    documentoUrl: c.documento, // você salva a URL no banco, então é ela mesma
    CondominioID: Number(c.CondominioID),
    nomeCondominio: c.Condominio?.nomecondominio || null,
  };
}

// 📋 Listar comunicados
const read = async (req, res) => {
  try {
    const comunicadosRaw = await prisma.comunicados.findMany({
      include: { Condominio: { select: { nomecondominio: true } } },
      orderBy: { comunicadosid: "desc" },
    });

    res.json(comunicadosRaw.map(mapComunicado));
  } catch (error) {
    console.error("Erro ao listar comunicados:", error);
    res.status(500).json({ error: "Erro ao listar comunicados" });
  }
};

// 🔎 Buscar comunicado por ID (para abrir modal sem 404)
const readById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "ID não informado." });

    const comunicado = await prisma.comunicados.findUnique({
      where: { comunicadosid: Number(id) },
      include: { Condominio: { select: { nomecondominio: true } } },
    });

    if (!comunicado) {
      return res.status(404).json({ error: "Comunicado não encontrado." });
    }

    return res.json(mapComunicado(comunicado));
  } catch (error) {
    console.error("Erro ao buscar comunicado:", error);
    return res.status(500).json({ error: "Erro ao buscar comunicado" });
  }
};

// 📤 Criar comunicado
const create = async (req, res) => {
  try {
    const { datacomunicado, descricao, CondominioID, documentoUrl } = req.body;

    if (!datacomunicado || !descricao || !CondominioID || !documentoUrl) {
      return res.status(400).json({
        error: "Campos obrigatórios: datacomunicado, descricao, CondominioID, documentoUrl.",
      });
    }

    const novoComunicado = await prisma.comunicados.create({
      data: {
        datacomunicado,
        descricao,
        documento: documentoUrl,
        Condominio: { connect: { condominioid: Number(CondominioID) } },
      },
      include: { Condominio: { select: { nomecondominio: true } } },
    });

    return res.status(201).json(mapComunicado(novoComunicado));
  } catch (error) {
    console.error("Erro ao criar comunicado:", error);
    return res.status(500).json({ error: "Erro ao criar comunicado" });
  }
};

// ✏️ Atualizar comunicado (documentoUrl opcional -> mantém o atual)
const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { datacomunicado, descricao, CondominioID, documentoUrl } = req.body;

    if (!id) return res.status(400).json({ error: "ID não informado." });

    if (!datacomunicado || !descricao || !CondominioID) {
      return res.status(400).json({
        error: "Campos obrigatórios: datacomunicado, descricao, CondominioID.",
      });
    }

    const atual = await prisma.comunicados.findUnique({
      where: { comunicadosid: Number(id) },
    });

    if (!atual) {
      return res.status(404).json({ error: "Comunicado não encontrado." });
    }

    const documentoFinal = documentoUrl && String(documentoUrl).trim()
      ? documentoUrl
      : atual.documento;

    const comunicadoAtualizado = await prisma.comunicados.update({
      where: { comunicadosid: Number(id) },
      data: {
        datacomunicado,
        descricao,
        documento: documentoFinal,
        Condominio: { connect: { condominioid: Number(CondominioID) } },
      },
      include: { Condominio: { select: { nomecondominio: true } } },
    });

    return res.status(200).json(mapComunicado(comunicadoAtualizado));
  } catch (error) {
    console.error("Erro ao atualizar comunicado:", error);
    return res.status(500).json({ error: "Erro ao atualizar comunicado" });
  }
};

// 🗑️ Excluir comunicado
const remove = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) return res.status(400).json({ error: "ID não informado." });

    await prisma.comunicados.delete({
      where: { comunicadosid: Number(id) },
    });

    return res.status(200).json({ message: "Excluído com sucesso." });
  } catch (err) {
    console.error("Erro ao excluir comunicado:", err);
    return res.status(500).json({ message: "Erro ao excluir" });
  }
};

module.exports = {
  read,
  readById,
  create,
  update,
  delete: remove,
};
