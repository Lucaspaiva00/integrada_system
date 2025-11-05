import { Router } from "express";
import * as clientesController from "./controllers/clientescontroller.cjs";
import * as inquilinosController from "./controllers/inquilinoscontroller.cjs";
import * as condominioController from "./controllers/condominiocontrollers.cjs";
import * as assembleiasController from "./controllers/assembleiascontroller.cjs";
import * as comunicadosController from "./controllers/comunicadoscontroller.cjs";
import * as prestacaoContasController from "./controllers/prestacaocontascontroller.cjs";
import * as loginControllerfrom from "./controllers/logincontroller.cjs";
import * as filesController from "./controllers/filescontroller.cjs";
import fs from "fs";
import prisma from "../prisma/connection.cjs";

const router = Router();

router.post("/login/proprietario", loginControllerfrom.loginProprietario);

router.get("/", (req, res) => {
  return res.json("API respondendo");
});
router.post("/clientescontroller", clientesController.create);
router.get("/clientescontroller", clientesController.read);
router.put("/clientescontroller/:id", clientesController.update);

router.post("/inquilinoscontroller", inquilinosController.create);
router.get("/inquilinoscontroller", inquilinosController.read);
router.put("/inquilinoscontroller/:id", inquilinosController.update);

router.post("/condominiocontroller", condominioController.create);
router.get("/condominiocontroller", condominioController.read);
router.put("/condominiocontroller/:id", condominioController.update);
router.get("/condominiocontroller/:id", condominioController.readById);

router.post("/assembleiascontroller", assembleiasController.create);
router.get("/assembleiascontroller", assembleiasController.read);

router.post("/comunicadoscontroller", comunicadosController.create);
router.get("/comunicadoscontroller", comunicadosController.read);

router.get("/prestacaocontascontroller", prestacaoContasController.read);
router.post("/prestacaocontascontroller", prestacaoContasController.create);
router.get("/documentos/:modulo/:filename", filesController.readFile);
router.get("/documentos-disponiveis", filesController.readAllDocuments);
router.get("/health", (req, res) => {
  res.status(200).send("OK");
});

router.get("/backup", async (req, res) => {
  const condominios = await prisma.condominio.findMany({
    include: {
      Inquilinos: true,
      Clientes: true,
      assembleia: true,
      comunicados: true,
      PrestacaoContas: true,
    },
  });

  fs.writeFileSync(
    "backup.json",
    JSON.stringify({ data: condominios }, null, 2),
    "utf-8"
  );

  res.download("backup.json");
});

export default router;
