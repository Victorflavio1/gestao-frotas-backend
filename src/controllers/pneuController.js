const db = require('../config/db');

exports.getPneus = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT p.*, 
             v.placa AS veiculo_placa, 
             v.modelo AS veiculo_modelo
      FROM pneus p
      LEFT JOIN veiculos v ON p.veiculo_id = v.id
      ORDER BY p.id DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error('Erro ao buscar pneus:', err);
    res.status(500).json({ erro: 'Erro interno ao buscar pneus.' });
  }
};

exports.createPneu = async (req, res) => {
  try {
    const {
      numero_fogo,
      marca,
      modelo,
      medida,
      tipo_vida,
      status,
      veiculo_id,
      posicao,
      km_instalacao,
      sulco_inicial,
      sulco_atual,
      data_aquisicao,
      custo_aquisicao,
    } = req.body;

    const [result] = await db.execute(
      `INSERT INTO pneus (numero_fogo, marca, modelo, medida, tipo_vida, status, veiculo_id, posicao, km_instalacao, km_atual, sulco_inicial, sulco_atual, data_aquisicao, custo_aquisicao)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        numero_fogo,
        marca,
        modelo,
        medida,
        tipo_vida || 'NOVO',
        status || 'ESTOQUE',
        veiculo_id || null,
        posicao || null,
        km_instalacao || 0,
        0,
        sulco_inicial || 16.0,
        sulco_atual || sulco_inicial || 16.0,
        data_aquisicao || null,
        custo_aquisicao || 0.0,
      ],
    );

    res
      .status(201)
      .json({ id: result.insertId, mensagem: 'Pneu cadastrado com sucesso!' });
  } catch (err) {
    console.error('Erro ao cadastrar pneu:', err);
    res
      .status(500)
      .json({
        erro: 'Erro ao cadastrar pneu (verifique se o número de fogo já existe).',
      });
  }
};

exports.updatePneu = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      numero_fogo,
      marca,
      modelo,
      medida,
      tipo_vida,
      status,
      veiculo_id,
      posicao,
      sulco_atual,
      custo_aquisicao,
    } = req.body;

    await db.execute(
      `UPDATE pneus SET numero_fogo = ?, marca = ?, modelo = ?, medida = ?, tipo_vida = ?, status = ?, veiculo_id = ?, posicao = ?, sulco_atual = ?, custo_aquisicao = ? WHERE id = ?`,
      [
        numero_fogo,
        marca,
        modelo,
        medida,
        tipo_vida,
        status,
        veiculo_id || null,
        posicao || null,
        sulco_atual,
        custo_aquisicao || 0.0,
        id,
      ],
    );

    res.json({ mensagem: 'Pneu atualizado com sucesso!' });
  } catch (err) {
    console.error('Erro ao atualizar pneu:', err);
    res.status(500).json({ erro: 'Erro ao atualizar pneu.' });
  }
};

exports.deletePneu = async (req, res) => {
  try {
    const { id } = req.params;
    await db.execute('DELETE FROM pneus WHERE id = ?', [id]);
    res.json({ mensagem: 'Pneu excluído com sucesso!' });
  } catch (err) {
    console.error('Erro ao excluir pneu:', err);
    res.status(500).json({ erro: 'Erro ao excluir pneu.' });
  }
};
