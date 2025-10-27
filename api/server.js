const express = require("express");
const cors = require("cors");
const routes = require("./src/routes");
const path = require("path");

const PORT = 3000;
const __dirname = process.cwd();

const app = express();
app.use("/uploads", express.static(path.join(__dirname, "src", "uploads")));
app.use(cors());
app.use(express.json());
app.use(routes);

app.listen(PORT, () => {
  console.log("API respondendo com sucesso na porta " + PORT);
});
