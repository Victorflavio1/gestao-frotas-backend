const express = require('express');
const router = express.Router();
const abastecimentoController = require('../controllers/abastecimentoController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post(
  '/',
  authMiddleware,
  abastecimentoController.cadastrarAbastecimento,
);
router.get(
  '/consumo/:veiculo_id',
  authMiddleware,
  abastecimentoController.relatorioConsumo,
);

module.exports = router;
