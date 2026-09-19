const express = require('express');
const router = express.Router();
const abastecimentoController = require('../controllers/abastecimentoController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/', authMiddleware, abastecimentoController.listarAbastecimentos);
router.post(
  '/',
  authMiddleware,
  abastecimentoController.cadastrarAbastecimento,
);
router.delete(
  '/:id',
  authMiddleware,
  abastecimentoController.deletarAbastecimento,
);
router.get(
  '/relatorio/:veiculo_id',
  authMiddleware,
  abastecimentoController.relatorioConsumo,
);

module.exports = router;
