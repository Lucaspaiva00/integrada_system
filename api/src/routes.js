const express = require('express');
const router = express.Router();

const clientescontroller = require('./controllers/clientescontroller');

router.get('/', (req, res) => { return res.json("API respondendo") });
router.post('/clientescontroller', clientescontroller.create);
router.get('/clientescontroller', clientescontroller.read);
// router.put('/clientescontroller', clientescontroller.update);
router.delete('/clientescontroller/:id', clientescontroller.del);

module.exports = router;