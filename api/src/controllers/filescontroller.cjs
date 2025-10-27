const path = require("path");
const fs = require("fs");
const readFile = async (req, res) => {
  try {
    const fileName = req.params.filename;
    const modulo = req.params.modulo; // 'prestacoes', 'assembleia', 'comunicados'
    const filePath = `./uploads/${modulo}/${fileName}`;
    const file = path.resolve(filePath);

    if (!fileName) {
      return res.status(400).json({ error: "Nome do arquivo não fornecido" });
    }

    const existsFile = fs.existsSync(file);
    if (!existsFile) {
      return res.status(404).json({ error: "Arquivo não encontrado" });
    }

    return res.sendFile(file);
  } catch (error) {
    console.error("Erro ao ler arquivos", error);
    res.status(500).json({ error: "Erro ao ler arquivos" });
  }
};

const readAllDocuments = async (req, res) => {
  try {
    const modules = [
      "prestacoes",
      "assembleia",
      "comunicados",
      "condominio",
      "inquilinos",
      "clientes",
    ];
    let allFiles = [];

    modules.forEach((modulo) => {
      const dirPath = path.resolve(`./uploads/${modulo}`);
      if (fs.existsSync(dirPath)) {
        allFiles.push(
          `${req.protocol}://${req.get(
            "host"
          )}/documentos/${modulo}/${filename}`
        );
      }
    });

    return res.json(allFiles);
  } catch (error) {
    console.error("Erro ao listar arquivos", error);
    res.status(500).json({ error: "Erro ao listar arquivos" });
  }
};

module.exports = {
  readFile,
  readAllDocuments,
};
