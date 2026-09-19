const db = require('../config/db');

// Listar todos os motoristas
exports.listarMotoristas = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM motoristas ORDER BY nome ASC');
    res.json(rows);
  } catch (err) {
    res
      .status(500)
      .json({ mensagem: 'Erro ao listar motoristas.', erro: err.message });
  }
};

// Cadastrar novo motorista
exports.cadastrarMotorista = async (req, res) => {
  const { nome, cpf, cnh, categoria_cnh } = req.body;

  try {
    await db.query(
      'INSERT INTO motoristas (nome, cpf, cnh, categoria_cnh) VALUES (?, ?, ?, ?)',
      [nome, cpf || null, cnh || null, categoria_cnh || null],
    );
    res.status(201).json({ mensagem: 'Motorista cadastrado com sucesso!' });
  } catch (err) {
    res
      .status(500)
      .json({ mensagem: 'Erro ao cadastrar motorista.', erro: err.message });
  }
};

// Deletar motorista
exports.deletarMotorista = async (req, res) => {
  const { id } = req.params;

  try {
    // Remove o vínculo nos abastecimentos mantendo o registro do abastecimento intacto
    await db.query(
      'UPDATE abastecimentos SET motorista_id = NULL WHERE motorista_id = ?',
      [id],
    );
    const [result] = await db.query('DELETE FROM motoristas WHERE id = ?', [
      id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ mensagem: 'Motorista não encontrado.' });
    }

    res.json({ mensagem: 'Motorista removido com sucesso!' });
  } catch (err) {
    res
      .status(500)
      .json({ mensagem: 'Erro ao excluir motorista.', erro: err.message });
  }
};
