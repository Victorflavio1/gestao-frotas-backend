const db = require('../config/db'); // Ajuste conforme a sua conexão com o banco

// Listar todas as manutenções (com dados do veículo)
exports.getManutencoes = async (req, res) => {
  try {
    const query = `
      SELECT m.*, v.placa as veiculo_placa, v.modelo as veiculo_modelo 
      FROM manutencoes m
      JOIN veiculos v ON m.veiculo_id = v.id
      ORDER BY m.data_manutencao DESC
    `;
    const [rows] = await db.execute(query);
    res.json(rows);
  } catch (err) {
    console.error('Erro ao buscar manutenções:', err);
    res.status(500).json({ erro: 'Erro interno ao buscar manutenções.' });
  }
};

// Criar nova manutenção
exports.createManutencao = async (req, res) => {
  try {
    const {
      veiculo_id,
      tipo_manutencao,
      status,
      data_manutencao,
      km_atual,
      oficina,
      valor_mao_obra,
      valor_pecas,
      descricao_servico,
      proxima_km,
      proxima_data
    } = req.body;

    if (!veiculo_id || !data_manutencao || !km_atual) {
      return res.status(400).json({ erro: 'Preencha os campos obrigatórios (Veículo, Data e KM).' });
    }

    const maoObra = Number(valor_mao_obra) || 0;
    const pecas = Number(valor_pecas) || 0;
    const custoTotal = maoObra + pecas;

    const query = `
      INSERT INTO manutencoes (
        veiculo_id, tipo_manutencao, status, data_manutencao, km_atual, 
        oficina, valor_mao_obra, valor_pecas, custo_total, 
        descricao_servico, proxima_km, proxima_data
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      veiculo_id,
      tipo_manutencao || 'PREVENTIVA',
      status || 'CONCLUIDA',
      data_manutencao,
      km_atual,
      oficina || null,
      maoObra,
      pecas,
      custoTotal,
      descricao_servico || null,
      proxima_km || null,
      proxima_data || null
    ];

    const [result] = await db.execute(query, values);
    res.status(201).json({ id: result.insertId, mensagem: 'Manutenção cadastrada com sucesso!' });
  } catch (err) {
    console.error('Erro ao criar manutenção:', err);
    res.status(500).json({ erro: 'Erro interno ao salvar manutenção.' });
  }
};

// Atualizar manutenção
exports.updateManutencao = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      veiculo_id,
      tipo_manutencao,
      status,
      data_manutencao,
      km_atual,
      oficina,
      valor_mao_obra,
      valor_pecas,
      descricao_servico,
      proxima_km,
      proxima_data
    } = req.body;

    const maoObra = Number(valor_mao_obra) || 0;
    const pecas = Number(valor_pecas) || 0;
    const custoTotal = maoObra + pecas;

    const query = `
      UPDATE manutencoes SET 
        veiculo_id = ?, tipo_manutencao = ?, status = ?, data_manutencao = ?, 
        km_atual = ?, oficina = ?, valor_mao_obra = ?, valor_pecas = ?, 
        custo_total = ?, descricao_servico = ?, proxima_km = ?, proxima_data = ?
      WHERE id = ?
    `;

    const values = [
      veiculo_id,
      tipo_manutencao,
      status,
      data_manutencao,
      km_atual,
      oficina,
      maoObra,
      pecas,
      custoTotal,
      descricao_servico,
      proxima_km,
      proxima_data,
      id
    ];

    await db.execute(query, values);
    res.json({ mensagem: 'Manutenção atualizada com sucesso!' });
  } catch (err) {
    console.error('Erro ao atualizar manutenção:', err);
    res.status(500).json({ erro: 'Erro interno ao atualizar manutenção.' });
  }
};

// Excluir manutenção
exports.deleteManutencao = async (req, res) => {
  try {
    const { id } = req.params;
    await db.execute('DELETE FROM manutencoes WHERE id = ?', [id]);
    res.json({ mensagem: 'Manutenção excluída com sucesso!' });
  } catch (err) {
    console.error('Erro ao excluir manutenção:', err);
    res.status(500).json({ erro: 'Erro interno ao excluir manutenção.' });
  }
};