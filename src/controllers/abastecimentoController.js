// Importa a conexão com o banco de dados
const db = require('../config/db');

// FUNÇÃO 1: REGISTRAR ABASTECIMENTO
exports.cadastrarAbastecimento = async (req, res) => {
  const { veiculo_id, motorista_id, km_abastecimento, litros, valor_total } =
    req.body;

  try {
    // Insere o registro de abastecimento no banco
    await db.query(
      `INSERT INTO abastecimentos 
            (veiculo_id, motorista_id, km_abastecimento, litros, valor_total) 
            VALUES (?, ?, ?, ?, ?)`,
      [veiculo_id, motorista_id, km_abastecimento, litros, valor_total],
    );

    // Atualiza a quilometragem atual do veículo se o KM informado for maior que o cadastrado
    await db.query(
      'UPDATE veiculos SET km_atual = ? WHERE id = ? AND km_atual < ?',
      [km_abastecimento, veiculo_id, km_abastecimento],
    );

    res.status(201).json({ mensagem: 'Abastecimento registrado com sucesso!' });
  } catch (err) {
    res
      .status(500)
      .json({
        mensagem: 'Erro ao registrar abastecimento.',
        erro: err.message,
      });
  }
};

// FUNÇÃO 2: RELATÓRIO DE CONSUMO MÉDIO (KM/L) POR VEÍCULO
exports.relatorioConsumo = async (req, res) => {
  const { veiculo_id } = req.params;

  try {
    // Busca os abastecimentos do veículo ordenados pelo KM
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

    // Calcula a variação de KM percorrida e o total de litros abastecidos
    const kmInicial = registros[0].km_abastecimento;
    const kmFinal = registros[registros.length - 1].km_abastecimento;
    const kmTotalPercorrido = kmFinal - kmInicial;

    // Soma os litros a partir do segundo abastecimento
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
    res
      .status(500)
      .json({
        mensagem: 'Erro ao calcular relatório de consumo.',
        erro: err.message,
      });
  }
};
