import { Router } from "express";
import multer, { diskStorage } from "multer";
import { join } from "path";
const router = Router();

import * as clientesController from "./controllers/clientescontroller.cjs";
import * as inquilinosController from "./controllers/inquilinoscontroller.cjs";
import * as condominioController from "./controllers/condominiocontrollers.cjs";
import * as assembleiasController from "./controllers/assembleiascontroller.cjs";
import * as comunicadosController from "./controllers/comunicadoscontroller.cjs";
import * as prestacaoContasController from "./controllers/prestacaocontascontroller.cjs";
import * as loginControllerfrom from "./controllers/logincontroller.cjs";
import * as filesController from "./controllers/filescontroller.cjs";

import prismaClient from "@prisma/client";
const prisma = new prismaClient.PrismaClient();

router.post("/login/proprietario", loginControllerfrom.loginProprietario);

const __dirname = process.cwd();

const storage = diskStorage({
  destination: (req, file, cb) => {
    cb(null, join(__dirname, "uploads/prestacoes"));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const storageAssembleia = diskStorage({
  destination: (req, file, cb) => {
    cb(null, join(__dirname, "uploads/assembleia")); // 📁 pasta já criada
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const storageComunicado = diskStorage({
  destination: (req, file, cb) => {
    cb(null, join(__dirname, "uploads/comunicados"));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const uploadComunicado = multer({ storage: storageComunicado });

const uploadAssembleia = multer({ storage: storageAssembleia });

const upload = multer({ storage });

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


router.post(
  "/assembleiascontroller",
  uploadAssembleia.single("documento"),
  assembleiasController.create
);
router.get("/assembleiascontroller", assembleiasController.read);

router.post(
  "/comunicadoscontroller",
  uploadComunicado.single("documento"),
  comunicadosController.create
);
router.get("/comunicadoscontroller", comunicadosController.read);

router.get("/prestacaocontascontroller", prestacaoContasController.read);
router.post(
  "/prestacaocontascontroller",
  upload.single("documento"),
  prestacaoContasController.create
);
router.get("/documentos/:modulo/:filename", filesController.readFile);
router.get("/documentos-disponiveis", filesController.readAllDocuments);
router.get("/health", (req, res) => {
  res.status(200).send("OK");
});

router.get("/teste", (req, res) => {
  try {
    prisma.$transaction((p) => {
      p.PrestacaoContas.deleteMany();
      p.comunicados.deleteMany();
      p.assembleia.deleteMany();
      p.Inquilinos.deleteMany();
      p.Clientes.deleteMany();
      p.Condominio.deleteMany();
    });
    res.status(200).json({ message: "Teste realizado com sucesso!" });
  } catch (error) {
    res.status(500).json({ error: "Erro no teste." });
  }
});

export default router;
