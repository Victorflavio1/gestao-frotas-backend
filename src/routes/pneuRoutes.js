const express = require('express');
const router = express.Router();
const controller = require('../controllers/pneuController');

router.get('/', controller.getPneus);
router.post('/', controller.createPneu);
router.put('/:id', controller.updatePneu);
router.delete('/:id', controller.deletePneu);

module.exports = router;
