const db = require('../config/db'); // Ajuste o caminho do db se necessário (ex: '../database')

exports.getPneus = async (req, res) => {
  try {
    const { marca, medida, status, estado_geral, veiculo_id } = req.query;
    let query = `
      SELECT p.*, v.placa as veiculo_placa, v.modelo as veiculo_modelo, v.status as veiculo_status
      FROM pneus p
      LEFT JOIN veiculos v ON p.veiculo_id = v.id
      WHERE 1=1
    `;
    const params = [];

    if (marca) {
      query += ` AND p.marca LIKE ?`;
      params.push(`%${marca}%`);
    }
    if (medida) {
      query += ` AND p.medida LIKE ?`;
      params.push(`%${medida}%`);
    }
    if (status) {
      query += ` AND p.status = ?`;
      params.push(status);
    }
    if (estado_geral) {
      query += ` AND p.estado_geral = ?`;
      params.push(estado_geral);
    }
    if (veiculo_id) {
      query += ` AND p.veiculo_id = ?`;
      params.push(veiculo_id);
    }

    query += ` ORDER BY p.id DESC`;
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('Erro ao buscar pneus:', err);
    res.status(500).json({ erro: 'Erro ao buscar pneus no servidor.' });
  }
};

exports.createPneu = async (req, res) => {
  try {
    const {
      identificador,
      veiculo_id,
      marca,
      medida,
      estado_geral,
      status,
      valor_aquisicao,
      km_instalacao,
      data_cadastro,
    } = req.body;

    if (!marca || !medida) {
      return res.status(400).json({ erro: 'Marca e Medida são obrigatórias.' });
    }

    const vId =
      veiculo_id && veiculo_id !== '' && veiculo_id !== 'null'
        ? Number(veiculo_id)
        : null;
    const ident =
      identificador || `PNEU-${Math.floor(1000 + Math.random() * 9000)}`;
    const dataCad = data_cadastro || new Date().toISOString().split('T')[0];

    const query = `
      INSERT INTO pneus (identificador, veiculo_id, marca, medida, estado_geral, status, valor_aquisicao, km_instalacao, data_cadastro)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      ident,
      vId,
      marca,
      medida,
      estado_geral || 'Novo',
      status || (vId ? 'Em Uso' : 'Estoque'),
      valor_aquisicao ? Number(valor_aquisicao) : 0,
      km_instalacao ? Number(km_instalacao) : 0,
      dataCad,
    ];

    await db.query(query, values);
    res
      .status(201)
      .json({ mensagem: 'Pneu cadastrado com sucesso!', identificador: ident });
  } catch (err) {
    console.error('Erro ao cadastrar pneu:', err);
    res
      .status(500)
      .json({ erro: 'Erro interno no servidor ao cadastrar pneu.' });
  }
};

exports.updatePneu = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      veiculo_id,
      marca,
      medida,
      estado_geral,
      status,
      valor_aquisicao,
      km_instalacao,
      data_cadastro,
    } = req.body;
    const vId =
      veiculo_id && veiculo_id !== '' && veiculo_id !== 'null'
        ? Number(veiculo_id)
        : null;

    const query = `
      UPDATE pneus 
      SET veiculo_id = ?, marca = ?, medida = ?, estado_geral = ?, status = ?, valor_aquisicao = ?, km_instalacao = ?, data_cadastro = ?
      WHERE id = ?
    `;

    const values = [
      vId,
      marca,
      medida,
      estado_geral,
      status,
      valor_aquisicao ? Number(valor_aquisicao) : 0,
      km_instalacao ? Number(km_instalacao) : 0,
      data_cadastro,
      id,
    ];

    await db.query(query, values);
    res.json({ mensagem: 'Pneu atualizado com sucesso!' });
  } catch (err) {
    console.error('Erro ao atualizar pneu:', err);
    res.status(500).json({ erro: 'Erro ao atualizar pneu.' });
  }
};

exports.deletePneu = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM pneus WHERE id = ?', [id]);
    res.json({ mensagem: 'Pneu excluído com sucesso!' });
  } catch (err) {
    console.error('Erro ao excluir pneu:', err);
    res.status(500).json({ erro: 'Erro ao excluir pneu.' });
  }
};

exports.getVeiculosElegiveis = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT id, placa, modelo, status 
      FROM veiculos 
      WHERE status IN ('Ativo', 'Em Uso', 'Manutenção', 'ATIVO', 'EM USO', 'MANUTENÇÃO')
      ORDER BY placa ASC
    `);
    res.json(rows);
  } catch (err) {
    console.error('Erro ao buscar veículos elegíveis:', err);
    res.status(500).json({ erro: 'Erro ao carregar veículos.' });
  }
};
