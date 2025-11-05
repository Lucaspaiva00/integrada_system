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

module.exports = {
  read,
  create,
};
