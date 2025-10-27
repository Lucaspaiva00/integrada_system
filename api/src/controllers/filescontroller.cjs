const path = require("path");
const readFile = async (req, res) => {
  try {
    const fileName = req.params.filename;
    const modulo = req.params.modulo; // 'prestacoes', 'assembleia', 'comunicados'
    const filePath = `./uploads/${modulo}/${fileName}`;
    const file = path.resolve(filePath);

    return res.sendFile(file);
  } catch (error) {
    console.error("Erro ao ler arquivos", error);
    res.status(500).json({ error: "Erro ao ler arquivos" });
  }
};

module.exports = {
  readFile,
};
