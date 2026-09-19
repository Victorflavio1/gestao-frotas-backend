// Importa a conexão com o banco de dados
const db = require('../config/db');

// FUNÇÃO 1: LISTAR ABASTECIMENTOS
exports.listarAbastecimentos = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT a.*, v.placa 
      FROM abastecimentos a 
      LEFT JOIN veiculos v ON a.veiculo_id = v.id
      ORDER BY a.data_abastecimento DESC, a.id DESC
    `);
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
    // 1. Busca Ano e KM Atual do veículo
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

    // --- VALIDAÇÃO 1: KM ABASTECIMENTO > KM ATUAL ---
    const kmAbastNum = parseFloat(km_abastecimento);
    const kmAtualNum = parseFloat(veiculo.km_atual || 0);

    if (isNaN(kmAbastNum) || kmAbastNum <= kmAtualNum) {
      return res.status(400).json({
        mensagem: 'Erro ao registrar abastecimento.',
        erro: `O KM do abastecimento (${kmAbastNum} km) precisa ser maior que o KM atual do veículo (${kmAtualNum} km).`,
      });
    }

    // --- VALIDAÇÃO 2: ANO DO ABASTECIMENTO >= ANO DO VEÍCULO ---
    // Extrai os primeiros 4 dígitos do texto da data (ex: '2026-09-18' -> 2026)
    let anoAbastecimento;
    if (data_abastecimento) {
      anoAbastecimento = parseInt(
        data_abastecimento.toString().substring(0, 4),
        10,
      );
    } else {
      anoAbastecimento = new Date().getFullYear();
    }

    const anoVeiculo = parseInt(veiculo.ano, 10);

    if (!isNaN(anoVeiculo) && anoAbastecimento < anoVeiculo) {
      return res.status(400).json({
        mensagem: 'Erro ao registrar abastecimento.',
        erro: `O ano do abastecimento (${anoAbastecimento}) não pode ser inferior ao ano do veículo (${anoVeiculo}).`,
      });
    }

    // --- SE PASSOU NAS VALIDAÇÕES, INSERE NO BANCO ---
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
        tipo_combustivel || 'GASOLINA',
      ],
    );

    // --- ATUALIZA O KM DO VEÍCULO ---
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
