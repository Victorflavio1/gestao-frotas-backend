const express = require('express');
const router = express.Router();
const controller = require('../controllers/manutencaoController');

// Como o server.js já usa '/api/manutencoes', aqui usamos apenas '/' e '/:id'
router.get('/', controller.getManutencoes);
router.post('/', controller.createManutencao);
router.put('/:id', controller.updateManutencao);
router.delete('/:id', controller.deleteManutencao);

module.exports = router;
