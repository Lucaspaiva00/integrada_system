const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

const clientescontroller = require("./controllers/clientescontroller");
const inquilinoscontroller = require("./controllers/inquilinoscontroller");
const condominiocontroller = require("./controllers/condominiocontrollers");
const assembleiascontroller = require("./controllers/assembleiascontroller");
const comunicadoscontroller = require("./controllers/comunicadoscontroller");
const prestacaocontascontroller = require("./controllers/prestacaocontascontroller");
const logincontroller = require("./controllers/logincontroller");

router.post("/login/proprietario", logincontroller.loginProprietario);

const __dirname = process.cwd();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "uploads/prestacoes"));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const storageAssembleia = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "uploads/assembleia")); // 📁 pasta já criada
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const storageComunicado = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "uploads/comunicados"));
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
router.post("/clientescontroller", clientescontroller.create);
router.get("/clientescontroller", clientescontroller.read);

router.post("/inquilinoscontroller", inquilinoscontroller.create);
router.get("/inquilinoscontroller", inquilinoscontroller.read);

router.post("/condominiocontroller", condominiocontroller.create);
router.get("/condominiocontroller", condominiocontroller.read);

router.post(
  "/assembleiascontroller",
  uploadAssembleia.single("documento"),
  assembleiascontroller.create
);
router.get("/assembleiascontroller", assembleiascontroller.read);

router.post(
  "/comunicadoscontroller",
  uploadComunicado.single("documento"),
  comunicadoscontroller.create
);
router.get("/comunicadoscontroller", comunicadoscontroller.read);

router.get("/prestacaocontascontroller", prestacaocontascontroller.read);
router.post(
  "/prestacaocontascontroller",
  upload.single("documento"),
  prestacaocontascontroller.create
);
router.get("/health", (req, res) => {
  res.status(200).send("OK");
});

module.exports = router;
