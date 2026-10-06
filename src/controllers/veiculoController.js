const db = require('../config/db');

// Função auxiliar para sanitizar e tratar o status antes de salvar no DB
const sanitizarStatus = (status) => {
  if (!status) return 'DISPONIVEL';

  const st = status.toString().trim().toUpperCase();

  // Mapeamentos comuns para garantir compatibilidade com o ENUM do MySQL
  if (st.includes('INATIV') || st.includes('DESATIV')) {
    return 'INATIVO';
  }
  if (st.includes('MANUTEN')) {
    return 'MANUTENCAO'; // Altere para 'EM_MANUTENCAO' se o ENUM do seu banco usar este valor
  }
  if (st.includes('USO') || st.includes('OCUP')) {
    return 'EM_USO';
  }

  return 'DISPONIVEL';
};

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

// CADASTRAR VEÍCULO
exports.cadastrarVeiculo = async (req, res) => {
  const {
    placa,
    modelo,
    marca,
    ano,
    cor,
    renavam,
    chassi,
    km_atual,
    ano_crlv,
    status,
    numeracao,
    tipo_combustivel,
    tipo_veiculo,
  } = req.body;

  try {
    const statusTratado = sanitizarStatus(status);

    const query = `
      INSERT INTO veiculos 
      (placa, modelo, marca, ano, cor, renavam, chassi, km_atual, ano_crlv, status, data_cadastro, numeracao, tipo_combustivel, tipo_veiculo)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?)
    `;

    await db.query(query, [
      placa,
      modelo,
      marca,
      ano,
      cor,
      renavam,
      chassi,
      km_atual,
      ano_crlv,
      statusTratado,
      numeracao,
      tipo_combustivel,
      tipo_veiculo,
    ]);

    return res
      .status(201)
      .json({ mensagem: 'Veículo cadastrado com sucesso!' });
  } catch (error) {
    return res.status(500).json({ erro: error.message });
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

// EDITAR VEÍCULO
exports.updateVeiculo = async (req, res) => {
  const { id } = req.params;
  const {
    placa,
    modelo,
    marca,
    ano,
    cor,
    renavam,
    chassi,
    km_atual,
    ano_crlv,
    status,
    numeracao,
    tipo_combustivel,
    tipo_veiculo,
  } = req.body;

  try {
    const statusTratado = sanitizarStatus(status);

    const query = `
      UPDATE veiculos 
      SET 
        placa = ?, 
        modelo = ?, 
        marca = ?, 
        ano = ?, 
        cor = ?, 
        renavam = ?, 
        chassi = ?, 
        km_atual = ?, 
        ano_crlv = ?, 
        status = ?, 
        numeracao = ?, 
        tipo_combustivel = ?, 
        tipo_veiculo = ?
      WHERE id = ?
    `;

    const [result] = await db.query(query, [
      placa,
      modelo,
      marca,
      ano,
      cor,
      renavam,
      chassi,
      km_atual,
      ano_crlv,
      statusTratado,
      numeracao,
      tipo_combustivel,
      tipo_veiculo,
      id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ erro: 'Veículo não encontrado.' });
    }

    return res
      .status(200)
      .json({ mensagem: 'Veículo atualizado com sucesso!' });
  } catch (error) {
    console.error('Erro ao atualizar veículo:', error);
    return res.status(500).json({ erro: error.message });
  }
};
