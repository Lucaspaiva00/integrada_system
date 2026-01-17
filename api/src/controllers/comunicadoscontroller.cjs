const prisma = require("../../prisma/connection.cjs");

// Base pública que aponta pro seu filesController
const BASE_URL = "https://integrada-api.onrender.com/documentos";

// 📋 Listar comunicados (para o app do morador)
const read = async (req, res) => {
  try {
    const comunicadosRaw = await prisma.comunicados.findMany({
      include: {
        Condominio: { select: { nomecondominio: true } },
      },
      orderBy: { comunicadosid: "desc" },
    });

    // Normaliza a saída pra já vir pronta pro front
    const comunicados = comunicadosRaw.map((c) => {
      return {
        comunicadosid: c.comunicadosid,
        datacomunicado: c.datacomunicado,
        descricao: c.descricao,
        // nome original do arquivo salvo
        documento: c.documento,
        // URL já clicável pro PDF (com encode pra nomes com espaço/acentos)
        documentoUrl: c.documento,
        // Condomínio
        CondominioID: Number(c.CondominioID),
        nomeCondominio: c.Condominio?.nomecondominio || null,
      };
    });

    res.json(comunicados);
  } catch (error) {
    console.error("Erro ao listar comunicados:", error);
    res.status(500).json({ error: "Erro ao listar comunicados" });
  }
};

// 📤 Criar comunicado com upload de documento (tela da Juliana)
const create = async (req, res) => {
  try {
    const { datacomunicado, descricao, CondominioID, documentoUrl } = req.body;

    if (!datacomunicado || !descricao || !CondominioID || !documentoUrl) {
      return res.status(400).json({
        error: "Campos obrigatórios ausentes (data, descrição ou condomínio).",
      });
    }

    // Salva no banco
    const novoComunicado = await prisma.comunicados.create({
      data: {
        datacomunicado,
        descricao,
        documento: documentoUrl,
        Condominio: { connect: { condominioid: Number(CondominioID) } },
      },
      include: {
        Condominio: { select: { nomecondominio: true } },
      },
    });

    // Monta a resposta no mesmo formato do read()
    const responseObj = {
      comunicadosid: novoComunicado.comunicadosid,
      datacomunicado: novoComunicado.datacomunicado,
      descricao: novoComunicado.descricao,
      documento: novoComunicado.documento,
      documentoUrl: novoComunicado.documento,
      CondominioID: Number(novoComunicado.CondominioID),
      nomeCondominio: novoComunicado.Condominio?.nomecondominio || null,
    };

    res.status(201).json(responseObj);
  } catch (error) {
    console.error("Erro ao criar comunicado:", error);
    res.status(500).json({ error: "Erro ao criar comunicado" });
  }
};

// ✏️ Atualizar comunicado (PUT)
const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { datacomunicado, descricao, CondominioID, documentoUrl } = req.body;

    if (!id) return res.status(400).json({ error: "ID não informado." });

    // valida obrigatórios (documentoUrl pode vir vazio se quiser manter? aqui eu exijo)
    if (!datacomunicado || !descricao || !CondominioID) {
      return res.status(400).json({
        error: "Campos obrigatórios ausentes (data, descrição ou condomínio).",
      });
    }

    // Se não mandar documentoUrl, mantém o atual
    // (isso é importante pro front: se editar sem trocar arquivo, não precisa re-upar)
    const atual = await prisma.comunicados.findUnique({
      where: { comunicadosid: Number(id) },
    });

    if (!atual) {
      return res.status(404).json({ error: "Comunicado não encontrado." });
    }

    const documentoFinal = documentoUrl ? documentoUrl : atual.documento;

    const comunicadoAtualizado = await prisma.comunicados.update({
      where: { comunicadosid: Number(id) },
      data: {
        datacomunicado,
        descricao,
        documento: documentoFinal,
        Condominio: { connect: { condominioid: Number(CondominioID) } },
      },
      include: {
        Condominio: { select: { nomecondominio: true } },
      },
    });

    const responseObj = {
      comunicadosid: comunicadoAtualizado.comunicadosid,
      datacomunicado: comunicadoAtualizado.datacomunicado,
      descricao: comunicadoAtualizado.descricao,
      documento: comunicadoAtualizado.documento,
      documentoUrl: comunicadoAtualizado.documento,
      CondominioID: Number(comunicadoAtualizado.CondominioID),
      nomeCondominio: comunicadoAtualizado.Condominio?.nomecondominio || null,
    };

    return res.status(200).json(responseObj);
  } catch (error) {
    console.error("Erro ao atualizar comunicado:", error);
    return res.status(500).json({ error: "Erro ao atualizar comunicado" });
  }
};

// 🗑️ Excluir comunicado
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
  update,
  delete: remove,
};
