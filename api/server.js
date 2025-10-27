import * as express from "express";
import cors from "cors";
import routes from "./src/routes.js";
import { join } from "path";

const PORT = 3000;
const __dirname = process.cwd();

const app = express.express();
app.use("/uploads", express.static(join(__dirname, "src", "uploads")));
app.use(cors());
app.use(express.json());
app.use(routes);

app.listen(PORT, () => {
  console.log("API respondendo com sucesso na porta " + PORT);
});
