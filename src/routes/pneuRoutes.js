const express = require('express');
const router = express.Router();
const pneuController = require('../controllers/pneuController');

// Verifique se todas estas funções existem e estão exportadas no pneuController.js
router.get('/veiculos-elegiveis', pneuController.getVeiculosElegiveis);
router.get('/', pneuController.getPneus);
router.post('/', pneuController.createPneu);
router.put('/:id', pneuController.updatePneu);
router.delete('/:id', pneuController.deletePneu);

module.exports = router;
