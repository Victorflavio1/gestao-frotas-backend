const db = require('../config/db'); // Ajuste conforme sua conexão com o banco

exports.getMultas = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT m.*, 
             v.placa AS veiculo_placa, 
             v.modelo AS veiculo_modelo,
             mo.nome AS motorista_nome
      FROM multas m
      JOIN veiculos v ON m.veiculo_id = v.id
      LEFT JOIN motoristas mo ON m.motorista_id = mo.id
      ORDER BY m.data_infracao DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error('Erro ao buscar multas:', err);
    res.status(500).json({ erro: 'Erro interno ao buscar multas.' });
  }
};

exports.createMulta = async (req, res) => {
  try {
    const {
      veiculo_id,
      motorista_id,
      auto_infracao,
      data_infracao,
      hora_infracao,
      localizacao,
      descricao_infracao,
      valor,
      pontos,
      status,
      vencimento,
    } = req.body;

    const [result] = await db.execute(
      `INSERT INTO multas (veiculo_id, motorista_id, auto_infracao, data_infracao, hora_infracao, localizacao, descricao_infracao, valor, pontos, status, vencimento) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        veiculo_id,
        motorista_id || null,
        auto_infracao,
        data_infracao,
        hora_infracao || null,
        localizacao,
        descricao_infracao,
        valor,
        pontos || 0,
        status || 'PENDENTE',
        vencimento || null,
      ],
    );

    res
      .status(201)
      .json({ id: result.insertId, mensagem: 'Multa cadastrada com sucesso!' });
  } catch (err) {
    console.error('Erro ao cadastrar multa:', err);
    res.status(500).json({ erro: 'Erro ao cadastrar multa.' });
  }
};

exports.updateMulta = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      veiculo_id,
      motorista_id,
      auto_infracao,
      data_infracao,
      hora_infracao,
      localizacao,
      descricao_infracao,
      valor,
      pontos,
      status,
      vencimento,
    } = req.body;

    await db.execute(
      `UPDATE multas SET veiculo_id = ?, motorista_id = ?, auto_infracao = ?, data_infracao = ?, hora_infracao = ?, localizacao = ?, descricao_infracao = ?, valor = ?, pontos = ?, status = ?, vencimento = ? WHERE id = ?`,
      [
        veiculo_id,
        motorista_id || null,
        auto_infracao,
        data_infracao,
        hora_infracao || null,
        localizacao,
        descricao_infracao,
        valor,
        pontos || 0,
        status,
        vencimento || null,
        id,
      ],
    );

    res.json({ mensagem: 'Multa atualizada com sucesso!' });
  } catch (err) {
    console.error('Erro ao atualizar multa:', err);
    res.status(500).json({ erro: 'Erro ao atualizar multa.' });
  }
};

exports.deleteMulta = async (req, res) => {
  try {
    const { id } = req.params;
    await db.execute('DELETE FROM multas WHERE id = ?', [id]);
    res.json({ mensagem: 'Multa excluída com sucesso!' });
  } catch (err) {
    console.error('Erro ao excluir multa:', err);
    res.status(500).json({ erro: 'Erro ao excluir multa.' });
  }
};
