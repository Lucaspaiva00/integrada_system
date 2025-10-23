const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const clientescontroller = require('./controllers/clientescontroller');
const inquilinoscontroller = require('./controllers/inquilinoscontroller')
const condominiocontroller = require('./controllers/condominiocontrollers');
const assembleiascontroller = require('./controllers/assembleiascontroller')
const comunicadoscontroller = require('./controllers/comunicadoscontroller')
const prestacaocontascontroller = require('./controllers/prestacaocontascontroller');
const logincontroller = require('./controllers/logincontroller');

router.post('/login/inquilino', logincontroller.loginInquilino);


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'uploads/prestacoes'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage });

router.get('/', (req, res) => { return res.json("API respondendo") });
router.post('/clientescontroller', clientescontroller.create);
router.get('/clientescontroller', clientescontroller.read);

router.post('/inquilinoscontroller', inquilinoscontroller.create);
router.get('/inquilinoscontroller', inquilinoscontroller.read);

router.post('/condominiocontroller', condominiocontroller.create);
router.get('/condominiocontroller', condominiocontroller.read);

router.post('/assembleiascontroller', assembleiascontroller.create);
router.get('/assembleiascontroller', assembleiascontroller.read);

router.post('/comunicadoscontroller', comunicadoscontroller.create);
router.get('/comunicadoscontroller', comunicadoscontroller.read);

router.get('/prestacaocontascontroller', prestacaocontascontroller.read);
router.post('/prestacaocontascontroller', upload.single('documento'), prestacaocontascontroller.create);

module.exports = router;