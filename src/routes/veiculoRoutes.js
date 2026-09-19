// Importa o Express para poder usar a estrutura de roteamento
const express = require('express');
const router = express.Router();

// Importa o controller correspondente que tem a lógica dos veículos
const veiculoController = require('../controllers/veiculoController');

// Importa o middleware que exige o token de autenticação antes de dar acesso
const authMiddleware = require('../middlewares/authMiddleware');

// Rota GET (para buscar/listar) -> Exige login (authMiddleware) -> Executa listarVeiculos
router.get('/', authMiddleware, veiculoController.listarVeiculos);

// Rota POST (para enviar/criar) -> Exige login (authMiddleware) -> Executa cadastrarVeiculo
router.post('/', authMiddleware, veiculoController.cadastrarVeiculo);

// Rota DELETE (para excluir) -> Exige login (authMiddleware) -> Executa deletarVeiculo
router.delete('/:id', authMiddleware, veiculoController.deletarVeiculo);
// Exporta as rotas para serem registradas no server.js
module.exports = router;
