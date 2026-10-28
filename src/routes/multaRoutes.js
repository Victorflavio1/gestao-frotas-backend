const express = require('express');
const router = express.Router();
const controller = require('../controllers/multaController');

router.get('/', controller.getMultas);
router.post('/', controller.createMulta);
router.put('/:id', controller.updateMulta);
router.delete('/:id', controller.deleteMulta);

module.exports = router;
