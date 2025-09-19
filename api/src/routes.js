const express = require('express');
const router = express.Router();

const clientescontroller = require('./controllers/clientescontroller');
const condominiocontroller = require('./controllers/condominiocontrollers');
const assembleiascontroller = require('./controllers/assembleiascontroller')
const comunicadoscontroller = require('./controllers/conunicadoscontroller')
const prestacaocontascontroller = require('./controllers/prestacaocontascontroller')

router.get('/', (req, res) => { return res.json("API respondendo") });
router.post('/clientescontroller', clientescontroller.create);
router.get('/clientescontroller', clientescontroller.read);
// router.put('/clientescontroller', clientescontroller.update);
router.delete('/clientescontroller/:id', clientescontroller.del);

router.post('/condominiocontroller', condominiocontroller.create);
router.get('/condominiocontroller', condominiocontroller.read);
// router.put('/condominiocontroller', clientescontroller.update);
router.delete('/condominiocontroller/:id', condominiocontroller.del);

router.post('/assembleiascontroller', assembleiascontroller.create);
router.get('/assembleiascontroller', assembleiascontroller.read);
// router.put('/assembleiascontroller', assembleiascontroller.update);
router.delete('/assembleiascontroller/:id', assembleiascontroller.del);

router.post('/comunicadoscontroller', comunicadoscontroller.create);
router.get('/comunicadoscontroller', comunicadoscontroller.read);
// router.put('/comunicadoscontroller', comunicadoscontroller.update);
router.delete('/comunicadoscontroller/:id', comunicadoscontroller.del);

router.post('/prestacaocontascontroller', prestacaocontascontroller.create);
router.get('/prestacaocontascontroller', prestacaocontascontroller.read);
// router.put('/prestacaocontascontroller', prestacaocontascontroller.update);
router.delete('/prestacaocontascontroller/:id', prestacaocontascontroller.del);


module.exports = router;