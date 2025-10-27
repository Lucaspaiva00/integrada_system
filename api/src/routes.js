import { Router } from "express";
import multer, { diskStorage } from "multer";
import { join } from "path";
const router = Router();

import { create, read } from "./controllers/clientescontroller";
import {
  create as _create,
  read as _read,
} from "./controllers/inquilinoscontroller";
import {
  create as __create,
  read as __read,
} from "./controllers/condominiocontrollers";
import {
  create as ___create,
  read as ___read,
} from "./controllers/assembleiascontroller";
import {
  create as ____create,
  read as ____read,
} from "./controllers/comunicadoscontroller";
import {
  read as _____read,
  create as _____create,
} from "./controllers/prestacaocontascontroller";
import { loginProprietario } from "./controllers/logincontroller";

router.post("/login/proprietario", loginProprietario);

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
router.post("/clientescontroller", create);
router.get("/clientescontroller", read);

router.post("/inquilinoscontroller", _create);
router.get("/inquilinoscontroller", _read);

router.post("/condominiocontroller", __create);
router.get("/condominiocontroller", __read);

router.post(
  "/assembleiascontroller",
  uploadAssembleia.single("documento"),
  ___create
);
router.get("/assembleiascontroller", ___read);

router.post(
  "/comunicadoscontroller",
  uploadComunicado.single("documento"),
  ____create
);
router.get("/comunicadoscontroller", ____read);

router.get("/prestacaocontascontroller", _____read);
router.post(
  "/prestacaocontascontroller",
  upload.single("documento"),
  _____create
);
router.get("/health", (req, res) => {
  res.status(200).send("OK");
});

export default router;
