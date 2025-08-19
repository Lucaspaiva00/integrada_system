const express = require('express');
const router = express.Router();

const clientescontroller = require('./controllers/clientescontroller');
const condominiocontroller = require('./controllers/condominiocontrollers');

router.get('/', (req, res) => { return res.json("API respondendo") });
router.post('/clientescontroller', clientescontroller.create);
router.get('/clientescontroller', clientescontroller.read);
// router.put('/clientescontroller', clientescontroller.update);
router.delete('/clientescontroller/:id', clientescontroller.del);

router.get('/', (req, res) => { return res.json("API respondendo") });
router.post('/condominiocontroller', condominiocontroller.create);
router.get('/condominiocontroller', condominiocontroller.read);
// router.put('/condominiocontroller', clientescontroller.update);
router.delete('/condominiocontroller/:id', condominiocontroller.del);

module.exports = router;