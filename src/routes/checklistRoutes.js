const express = require('express');
const router = express.Router();
const checklistController = require('../controllers/checklistController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/', authMiddleware, checklistController.cadastrarChecklist);
router.get('/', authMiddleware, checklistController.listarChecklists);

module.exports = router;
