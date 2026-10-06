// routes/checklistRoutes.js
const express = require('express');
const router = express.Router();
const checklistController = require('../controllers/checklistController');

// A rota final será http://localhost:3000/checklists
router.get('/', checklistController.listarChecklists);
router.post('/', checklistController.criarChecklist);

module.exports = router;
