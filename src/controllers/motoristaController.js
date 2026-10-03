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
  const { nome, cpf, cnh, categoria_cnh, vencimento_cnh } = req.body;

  // Formata data de vencimento se enviada no cadastro
  let vencimentoFinal = null;
  if (vencimento_cnh && vencimento_cnh.toString().trim() !== '') {
    if (vencimento_cnh.includes('/')) {
      const [dia, mes, ano] = vencimento_cnh.split('/');
      vencimentoFinal = `${ano}-${mes}-${dia}`;
    } else {
      vencimentoFinal = vencimento_cnh.toString().substring(0, 10);
    }
  }

  try {
    await db.query(
      'INSERT INTO motoristas (nome, cpf, cnh, categoria_cnh, vencimento_cnh) VALUES (?, ?, ?, ?, ?)',
      [nome, cpf || null, cnh || null, categoria_cnh || null, vencimentoFinal],
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

// Atualizar motorista
exports.updateMotorista = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, cpf, cnh, categoria_cnh, vencimento_cnh } = req.body;

    // Formata a data para YYYY-MM-DD para o MySQL aceitar
    let vencimentoFinal = null;
    if (vencimento_cnh && vencimento_cnh.toString().trim() !== '') {
      if (vencimento_cnh.includes('/')) {
        const [dia, mes, ano] = vencimento_cnh.split('/');
        vencimentoFinal = `${ano}-${mes}-${dia}`;
      } else {
        vencimentoFinal = vencimento_cnh.toString().substring(0, 10);
      }
    }

    const query = `
      UPDATE motoristas 
      SET nome = ?, 
          cpf = ?, 
          cnh = ?, 
          categoria_cnh = ?, 
          vencimento_cnh = ? 
      WHERE id = ?
    `;

    const values = [nome, cpf, cnh, categoria_cnh, vencimentoFinal, id];

    const [result] = await db.query(query, values);

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ erro: 'Motorista não encontrado ou nenhum dado alterado.' });
    }

    return res
      .status(200)
      .json({ mensagem: 'Motorista atualizado com sucesso!' });
  } catch (error) {
    console.error('Erro ao atualizar motorista:', error);
    return res
      .status(500)
      .json({ erro: 'Erro interno ao atualizar motorista.' });
  }
};
