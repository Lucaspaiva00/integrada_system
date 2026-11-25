import { Router } from "express";
import * as clientesController from "./controllers/clientescontroller.cjs";
import * as inquilinosController from "./controllers/inquilinoscontroller.cjs";
import * as condominioController from "./controllers/condominiocontrollers.cjs";
import * as assembleiasController from "./controllers/assembleiascontroller.cjs";
import * as comunicadosController from "./controllers/comunicadoscontroller.cjs";
import * as prestacaoContasController from "./controllers/prestacaocontascontroller.cjs";
import * as loginControllerfrom from "./controllers/logincontroller.cjs";
import * as filesController from "./controllers/filescontroller.cjs";
import pdf from "./controllers/boletospdfcontroller.cjs";
import admin from "./security/boletos-admin.cjs";

import portal from "./controllers/portalcontroller.cjs";
import security from "./security/proprietario.cjs";
const router = Router();
router.use('/portal', security.authenticate);
router.get('/portal/me', portal.me);
router.get('/portal/boletos', pdf.authorizeOwner, portal.boletos);
router.get('/portal/boletos-pdf', pdf.authorizeOwner, pdf.ownerList);
router.get('/portal/boletos-pdf/:id', pdf.authorizeOwner, pdf.send);
router.get('/portal/comunicados', portal.comunicados);
router.get('/portal/prestacoes', portal.prestacoes);
router.get('/portal/assembleias', portal.assembleias);

router.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

router.post("/login/proprietario", security.loginLimit, loginControllerfrom.loginProprietario);

router.get("/", (req, res) => res.json("API respondendo"));

router.use(["/clientescontroller", "/inquilinoscontroller", "/condominiocontroller"], admin.authenticate);

// CLIENTES
router.post("/clientescontroller", clientesController.create);
router.get("/clientescontroller", clientesController.read);
router.put("/clientescontroller/:id", clientesController.update);

// INQUILINOS
router.post("/inquilinoscontroller", inquilinosController.create);
router.get("/inquilinoscontroller", inquilinosController.read);
router.put("/inquilinoscontroller/:id", inquilinosController.update);

// CONDOMINIOS
router.post("/condominiocontroller", condominioController.create);
router.get("/condominiocontroller", condominioController.read);
router.get("/condominiocontroller/:id", condominioController.readById);
router.put("/condominiocontroller/:id", condominioController.update);

// ASSEMBLEIAS
router.post("/assembleiascontroller", assembleiasController.create);
router.get("/assembleiascontroller", assembleiasController.read);
router.delete("/assembleiascontroller/:id", assembleiasController.delete);

// COMUNICADOS ✅ (com GET por id + PUT + DELETE)
router.post("/comunicadoscontroller", comunicadosController.create);
router.get("/comunicadoscontroller", comunicadosController.read);
router.get("/comunicadoscontroller/:id", comunicadosController.readById); // ✅ importante p/ modal
router.put("/comunicadoscontroller/:id", comunicadosController.update);
router.delete("/comunicadoscontroller/:id", comunicadosController.delete);

// PRESTACAO CONTAS
router.get("/prestacaocontascontroller", prestacaoContasController.read);
router.post("/prestacaocontascontroller", prestacaoContasController.create);
router.delete("/prestacaocontascontroller/:id", prestacaoContasController.delete);

router.post("/admin/login", security.loginLimit, admin.login);
router.use("/admin/boletos", admin.authenticate);
router.get("/admin/boletos/condominios", pdf.condos);
router.get("/admin/boletos/condominios/:condominioid/proprietarios", pdf.owners);
router.get("/admin/boletos", pdf.list);
router.post("/admin/boletos", pdf.upload, pdf.create);
router.get("/admin/boletos/:id", pdf.send);
router.put("/admin/boletos/:id", pdf.upload, pdf.replace);
router.delete("/admin/boletos/:id", pdf.remove);

// FILES
router.get("/documentos/:modulo/:filename", filesController.readFile);
router.get("/documentos-disponiveis", filesController.readAllDocuments);

router.get("/health", (req, res) => res.status(200).send("OK"));

export default router;
