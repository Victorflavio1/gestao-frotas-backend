const express = require('express');
const router = express.Router();
const motoristaController = require('../controllers/motoristaController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/', authMiddleware, motoristaController.listarMotoristas);
router.post('/', authMiddleware, motoristaController.cadastrarMotorista);
router.delete('/:id', authMiddleware, motoristaController.deletarMotorista);

module.exports = router;
