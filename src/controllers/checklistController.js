const db = require('../config/db'); // Ajuste conforme seu arquivo de conexão com BD

exports.criarChecklist = async (req, res) => {
  try {
    const {
      tipo_checklist,
      veiculo_id,
      motorista_id,
      km_atual,
      nivel_combustivel,
      cartao_combustivel,
      documento_crlv,
      triangulo,
      chave_roda,
      macaco,
      extintor,
      tacografos_faixas,
      epis_capacete,
      nivel_oleo,
      liquido_arrefecimento,
      sistema_freio,
      suspensao_transmissao,
      hidraulico_munck,
      pneu_dd,
      pneu_de,
      pneu_td,
      pneu_te,
      estepe,
      eletrica_farois,
      parabrisa_limpadores,
      observacoes,
    } = req.body;

    // Lógica para determinar se existe alguma pendência grave no veículo
    const itensComPendencia = [
      documento_crlv,
      triangulo,
      chave_roda,
      macaco,
      extintor,
      tacografos_faixas,
      epis_capacete,
      nivel_oleo,
      liquido_arrefecimento,
      sistema_freio,
      suspensao_transmissao,
      hidraulico_munck,
      eletrica_farois,
      parabrisa_limpadores,
    ].some(
      (item) =>
        item &&
        (item.includes('NAO') ||
          item.includes('DEFEITO') ||
          item.includes('VAZAMENTO') ||
          item.includes('TRINCADO')),
    );

    const pneusComProblema = [pneu_dd, pneu_de, pneu_td, pneu_te, estepe].some(
      (pneu) => pneu === 'RUIM',
    );

    const status_geral =
      itensComPendencia || pneusComProblema ? 'COM_PENDENCIA' : 'APROVADO';

    const sql = `
      INSERT INTO checklists (
        tipo_checklist, veiculo_id, motorista_id, km_atual, nivel_combustivel, cartao_combustivel,
        documento_crlv, triangulo, chave_roda, macaco, extintor, tacografos_faixas, epis_capacete,
        nivel_oleo, liquido_arrefecimento, sistema_freio, suspensao_transmissao, hidraulico_munck,
        pneu_dd, pneu_de, pneu_td, pneu_te, estepe, eletrica_farois, parabrisa_limpadores,
        observacoes, status_geral
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      tipo_checklist,
      veiculo_id,
      motorista_id,
      km_atual,
      nivel_combustivel,
      cartao_combustivel,
      documento_crlv,
      triangulo,
      chave_roda,
      macaco,
      extintor,
      tacografos_faixas,
      epis_capacete,
      nivel_oleo,
      liquido_arrefecimento,
      sistema_freio,
      suspensao_transmissao,
      hidraulico_munck,
      pneu_dd,
      pneu_de,
      pneu_td,
      pneu_te,
      estepe,
      eletrica_farois,
      parabrisa_limpadores,
      observacoes,
      status_geral,
    ];

    await db.query(sql, values);

    return res
      .status(201)
      .json({ mensagem: 'Checklist salvo com sucesso!', status_geral });
  } catch (error) {
    console.error('Erro ao salvar checklist:', error);
    return res
      .status(500)
      .json({ erro: 'Erro interno ao registrar checklist.' });
  }
};

exports.listarChecklists = async (req, res) => {
  try {
    const sql = `
      SELECT c.*, v.placa, v.modelo, m.nome as motorista_nome 
      FROM checklists c
      LEFT JOIN veiculos v ON c.veiculo_id = v.id
      LEFT JOIN motoristas m ON c.motorista_id = m.id
      ORDER BY c.data_checklist DESC
    `;
    const [rows] = await db.query(sql);
    return res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar checklists:', error);
    return res.status(500).json({ erro: 'Erro interno ao buscar checklists.' });
  }
};
