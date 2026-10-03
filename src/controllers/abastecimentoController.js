// Importa a conexão com o banco de dados
const db = require('../config/db');

/// FUNÇÃO 1: LISTAR ABASTECIMENTOS
exports.listarAbastecimentos = async (req, res) => {
  try {
    const query = `
      SELECT 
        a.*,
        v.placa AS veiculo_placa,
        v.modelo AS veiculo_modelo,
        m.nome AS motorista_nome
      FROM abastecimentos a
      LEFT JOIN veiculos v ON a.veiculo_id = v.id
      LEFT JOIN motoristas m ON a.motorista_id = m.id
      ORDER BY a.data_abastecimento DESC, a.id DESC
    `;

    const [rows] = await db.query(query);
    res.json(rows);
  } catch (err) {
    res.status(500).json({
      mensagem: 'Erro ao listar abastecimentos.',
      erro: err.message,
    });
  }
};
// FUNÇÃO: REGISTRAR ABASTECIMENTO COM VALIDAÇÕES RÍGIDAS
exports.cadastrarAbastecimento = async (req, res) => {
  const {
    veiculo_id,
    motorista_id,
    data_abastecimento,
    km_abastecimento,
    litros,
    valor_unitario,
    valor_total,
    posto,
    tipo_combustivel,
  } = req.body;

  try {
    // 1. Busca os dados do veículo (Ano e KM Inicial de Cadastro)
    const [veiculos] = await db.query(
      'SELECT ano, km_atual FROM veiculos WHERE id = ?',
      [veiculo_id],
    );

    if (veiculos.length === 0) {
      return res.status(404).json({
        mensagem: 'Erro ao registrar abastecimento.',
        erro: 'Veículo não encontrado.',
      });
    }

    const veiculo = veiculos[0];

    // 2. Busca o Maior KM de Abastecimento já registrado para este veículo
    const [ultimoAbast] = await db.query(
      'SELECT MAX(km_abastecimento) as maior_km FROM abastecimentos WHERE veiculo_id = ?',
      [veiculo_id],
    );

    const kmCadastroVeiculo = parseFloat(veiculo.km_atual || 0);
    const maiorKmAbastecido = ultimoAbast[0]?.maior_km
      ? parseFloat(ultimoAbast[0].maior_km)
      : 0;

    // O KM mínimo obrigatório é o maior valor entre o KM de cadastro e o do último abastecimento
    const kmMinimoRequerido = Math.max(kmCadastroVeiculo, maiorKmAbastecido);
    const kmAbastNum = parseFloat(km_abastecimento);

    // --- VALIDAÇÃO DE KM CRESCENTE ---
    if (isNaN(kmAbastNum) || kmAbastNum <= kmMinimoRequerido) {
      return res.status(400).json({
        mensagem: 'KM Inválido',
        erro: `O KM informado (${kmAbastNum} km) precisa ser estritamente maior que o último KM registrado (${kmMinimoRequerido} km).`,
      });
    }

    // --- VALIDAÇÃO DE ANO ---
    let anoAbastecimento = data_abastecimento
      ? parseInt(data_abastecimento.toString().substring(0, 4), 10)
      : new Date().getFullYear();
    const anoVeiculo = parseInt(veiculo.ano, 10);

    if (!isNaN(anoVeiculo) && anoAbastecimento < anoVeiculo) {
      return res.status(400).json({
        mensagem: 'Erro ao registrar abastecimento.',
        erro: `O ano do abastecimento (${anoAbastecimento}) não pode ser inferior ao ano do veículo (${anoVeiculo}).`,
      });
    }

    // --- INSERÇÃO NO BANCO ---
    await db.query(
      `INSERT INTO abastecimentos 
        (veiculo_id, motorista_id, data_abastecimento, km_abastecimento, litros, valor_unitario, valor_total, posto, tipo_combustivel) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        veiculo_id,
        motorista_id || null,
        data_abastecimento || new Date(),
        kmAbastNum,
        litros,
        valor_unitario || null,
        valor_total,
        posto || null,
        tipo_combustivel || 'FLEX',
      ],
    );

    /// --- ATUALIZA O KM ATUAL DO VEÍCULO ---
    await db.query('UPDATE veiculos SET km_atual = ? WHERE id = ?', [
      kmAbastNum,
      veiculo_id,
    ]);

    return res
      .status(201)
      .json({ mensagem: 'Abastecimento registrado com sucesso!' });
  } catch (err) {
    return res.status(500).json({
      mensagem: 'Erro ao registrar abastecimento.',
      erro: err.message,
    });
  }
};

// FUNÇÃO 3: DELETAR ABASTECIMENTO
exports.deletarAbastecimento = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query('DELETE FROM abastecimentos WHERE id = ?', [
      id,
    ]);

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ mensagem: 'Abastecimento não encontrado.' });
    }

    res.json({ mensagem: 'Abastecimento removido com sucesso!' });
  } catch (err) {
    res.status(500).json({
      mensagem: 'Erro ao excluir abastecimento.',
      erro: err.message,
    });
  }
};

// FUNÇÃO 4: RELATÓRIO DE CONSUMO MÉDIO (KM/L) POR VEÍCULO
exports.relatorioConsumo = async (req, res) => {
  const { veiculo_id } = req.params;

  try {
    const [registros] = await db.query(
      'SELECT * FROM abastecimentos WHERE veiculo_id = ? ORDER BY km_abastecimento ASC',
      [veiculo_id],
    );

    if (registros.length < 2) {
      return res.json({
        mensagem:
          'São necessários pelo menos 2 abastecimentos para calcular a média de consumo.',
      });
    }

    const kmInicial = registros[0].km_abastecimento;
    const kmFinal = registros[registros.length - 1].km_abastecimento;
    const kmTotalPercorrido = kmFinal - kmInicial;

    let litrosTotais = 0;
    for (let i = 1; i < registros.length; i++) {
      litrosTotais += parseFloat(registros[i].litros);
    }

    const mediaKmLiter = (kmTotalPercorrido / litrosTotais).toFixed(2);

    res.json({
      veiculo_id,
      kmTotalPercorrido,
      litrosTotais,
      mediaKmLiter: `${mediaKmLiter} km/L`,
    });
  } catch (err) {
    res.status(500).json({
      mensagem: 'Erro ao calcular relatório de consumo.',
      erro: err.message,
    });
  }
};

// FUNÇÃO 5: ATUALIZAR ABASTECIMENTO (PERMISSIVA COM ATUALIZAÇÃO RECALCULADA DO VEÍCULO)
exports.atualizarAbastecimento = async (req, res) => {
  const { id } = req.params;
  const {
    veiculo_id,
    motorista_id,
    data_abastecimento,
    km_abastecimento,
    litros,
    valor_unitario,
    valor_total,
    posto,
    tipo_combustivel,
  } = req.body;

  try {
    const kmAbastNum = parseFloat(km_abastecimento);

    if (isNaN(kmAbastNum) || kmAbastNum <= 0) {
      return res.status(400).json({
        mensagem: 'KM Inválido',
        erro: 'Informe um valor de KM válido maior que zero.',
      });
    }

    // 1. Atualiza o registro de abastecimento no banco
    const [result] = await db.query(
      `UPDATE abastecimentos 
       SET 
         veiculo_id = ?, 
         motorista_id = ?, 
         data_abastecimento = ?, 
         km_abastecimento = ?, 
         litros = ?, 
         valor_unitario = ?, 
         valor_total = ?, 
         posto = ?, 
         tipo_combustivel = ?
       WHERE id = ?`,
      [
        veiculo_id,
        motorista_id || null,
        data_abastecimento,
        kmAbastNum,
        litros,
        valor_unitario || null,
        valor_total,
        posto || null,
        tipo_combustivel || 'FLEX',
        id,
      ],
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ mensagem: 'Abastecimento não encontrado para atualização.' });
    }

    // 2. Recalcula e sincroniza o km_atual do veículo com o MAIOR KM registrado entre todos os abastecimentos
    const [maiorGeral] = await db.query(
      'SELECT MAX(km_abastecimento) as max_km FROM abastecimentos WHERE veiculo_id = ?',
      [veiculo_id],
    );

    const novoKmVeiculo = maiorGeral[0]?.max_km || kmAbastNum;

    await db.query('UPDATE veiculos SET km_atual = ? WHERE id = ?', [
      novoKmVeiculo,
      veiculo_id,
    ]);

    return res
      .status(200)
      .json({ mensagem: 'Abastecimento atualizado com sucesso!' });
  } catch (err) {
    return res.status(500).json({
      mensagem: 'Erro ao atualizar abastecimento.',
      erro: err.message,
    });
  }
};
