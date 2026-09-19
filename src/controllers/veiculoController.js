const db = require('../config/db');

// LISTAR VEÍCULOS
exports.listarVeiculos = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM veiculos ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    res
      .status(500)
      .json({ mensagem: 'Erro ao listar veículos.', erro: err.message });
  }
};

// CADASTRAR VEÍCULO (Verifique se o nome bate com o das rotas)
exports.cadastrarVeiculo = async (req, res) => {
  const { placa, modelo, marca, ano, cor, renavam, chassi, km_atual } =
    req.body;

  try {
    await db.query(
      `INSERT INTO veiculos (placa, modelo, marca, ano, cor, renavam, chassi, km_atual) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [placa, modelo, marca, ano, cor, renavam, chassi, km_atual || 0],
    );

    res.status(201).json({ mensagem: 'Veículo cadastrado com sucesso!' });
  } catch (err) {
    res
      .status(500)
      .json({ mensagem: 'Erro ao cadastrar veículo.', erro: err.message });
  }
};

// DELETAR VEÍCULO
exports.deletarVeiculo = async (req, res) => {
  const { id } = req.params;

  try {
    await db.query('DELETE FROM abastecimentos WHERE veiculo_id = ?', [id]);
    const [result] = await db.query('DELETE FROM veiculos WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ mensagem: 'Veículo não encontrado.' });
    }

    res.json({ mensagem: 'Veículo removido com sucesso!' });
  } catch (err) {
    res
      .status(500)
      .json({ mensagem: 'Erro ao excluir veículo.', erro: err.message });
  }
};
