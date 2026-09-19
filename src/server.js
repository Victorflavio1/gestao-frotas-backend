const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Importação das Rotas
const authRoutes = require('./routes/authRoutes');
const veiculoRoutes = require('./routes/veiculoRoutes');
const checklistRoutes = require('./routes/checklistRoutes');
const abastecimentoRoutes = require('./routes/abastecimentoRoutes');
const motoristaRoutes = require('./routes/motoristaRoutes');

// Inicialização do App
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Registro dos Endpoints da API
app.use('/api/auth', authRoutes);
app.use('/api/veiculos', veiculoRoutes);
app.use('/api/checklists', checklistRoutes);
app.use('/api/abastecimentos', abastecimentoRoutes);
app.use('/api/motoristas', motoristaRoutes);

app.get('/', (req, res) => {
  res.send('API da Gestão de Frotas rodando com sucesso!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
