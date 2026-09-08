// Importa o arquivo de conexão com o banco de dados MySQL
const db = require('../config/db');

// FUNÇÃO 1: LISTAR TODOS OS VEÍCULOS CADASTRADOS
exports.listarVeiculos = async (req, res) => {
  try {
    // Executa um SELECT simples na tabela de veículos para buscar todas as linhas
    const [veiculos] = await db.query('SELECT * FROM veiculos');

    // Retorna a lista de veículos obtida diretamente em formato JSON para o front-end
    res.json(veiculos);
  } catch (err) {
    res
      .status(500)
      .json({ mensagem: 'Erro ao buscar veículos.', erro: err.message });
  }
};

// FUNÇÃO 2: CADASTRAR UM NOVO VEÍCULO
exports.cadastrarVeiculo = async (req, res) => {
  // Pega as informações de cadastro do veículo enviadas pela requisição
  const { placa, modelo, marca, ano, renavam, vencimento_crlv, km_atual } =
    req.body;

  try {
    // Executa a instrução SQL de inserção (INSERT) preenchendo as colunas do banco
    await db.query(
      'INSERT INTO veiculos (placa, modelo, marca, ano, renavam, vencimento_crlv, km_atual) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [placa, modelo, marca, ano, renavam, vencimento_crlv, km_atual || 0],
    );

    // Confirma o sucesso ao cliente
    res.status(201).json({ mensagem: 'Veículo cadastrado com sucesso!' });
  } catch (err) {
    res
      .status(500)
      .json({ mensagem: 'Erro ao cadastrar veículo.', erro: err.message });
  }
};
