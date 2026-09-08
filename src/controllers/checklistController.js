// Importa a conexão com o banco de dados
const db = require('../config/db');

// FUNÇÃO 1: CADASTRAR UM NOVO CHECKLIST
exports.cadastrarChecklist = async (req, res) => {
  // Pega as informações de inspeção enviadas pelo motorista no formulário
  const {
    veiculo_id,
    motorista_id,
    km_registro,
    nivel_combustivel,
    pneus_ok,
    oleo_ok,
    observacoes,
  } = req.body;

  try {
    // Insere o registro de inspeção na tabela "checklists"
    await db.query(
      `INSERT INTO checklists 
            (veiculo_id, motorista_id, km_registro, nivel_combustivel, pneus_ok, oleo_ok, observacoes) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        veiculo_id,
        motorista_id,
        km_registro,
        nivel_combustivel,
        pneus_ok,
        oleo_ok,
        observacoes,
      ],
    );

    // Atualiza automaticamente a quilometragem atual do veículo na tabela "veiculos"
    await db.query('UPDATE veiculos SET km_atual = ? WHERE id = ?', [
      km_registro,
      veiculo_id,
    ]);

    res.status(201).json({ mensagem: 'Checklist registrado com sucesso!' });
  } catch (err) {
    res
      .status(500)
      .json({ mensagem: 'Erro ao registrar checklist.', erro: err.message });
  }
};

// FUNÇÃO 2: LISTAR HISTÓRICO DE CHECKLISTS
exports.listarChecklists = async (req, res) => {
  try {
    // Busca os checklists trazendo os nomes do veículo e do motorista via JOIN
    const [checklists] = await db.query(
      `SELECT c.*, v.modelo AS veiculo_modelo, v.placa, m.nome AS motorista_nome 
             FROM checklists c
             JOIN veiculos v ON c.veiculo_id = v.id
             JOIN motoristas m ON c.motorista_id = m.id
             ORDER BY c.data_registro DESC`,
    );
    res.json(checklists);
  } catch (err) {
    res
      .status(500)
      .json({ mensagem: 'Erro ao buscar checklists.', erro: err.message });
  }
};
