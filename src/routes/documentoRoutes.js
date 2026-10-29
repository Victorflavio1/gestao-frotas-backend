const express = require('express');
const router = express.Router();
const controller = require('../controllers/documentoController');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    // Salva com o nome original preservando a extensão (.pdf, .png, etc.)
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// CORREÇÃO: Utilizar 'storage' em vez de 'dest'
const upload = multer({ storage: storage });

router.get('/', controller.getDocumentos);
router.post('/', upload.single('arquivo'), controller.createDocumento);
router.put('/:id', upload.single('arquivo'), controller.updateDocumento);
router.delete('/:id', controller.deleteDocumento);

module.exports = router;
