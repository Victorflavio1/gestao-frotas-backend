const db = require('../config/db');
const path = require('path');
const fs = require('fs');

exports.getDocumentos = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT d.*, 
             v.placa AS veiculo_placa, 
             v.modelo AS veiculo_modelo
      FROM documentos_veiculos d
      JOIN veiculos v ON d.veiculo_id = v.id
      ORDER BY d.data_vencimento ASC
    `);
    res.json(rows);
  } catch (err) {
    console.error('Erro ao buscar documentos:', err);
    res.status(500).json({ erro: 'Erro interno ao buscar documentos.' });
  }
};

exports.createDocumento = async (req, res) => {
  try {
    const {
      veiculo_id,
      tipo_documento,
      numero_documento,
      data_emissao,
      data_vencimento,
      valor,
      status,
      observacao,
    } = req.body;

    const arquivo = req.file ? `/uploads/${req.file.filename}` : null;

    const [result] = await db.execute(
      `INSERT INTO documentos_veiculos (veiculo_id, tipo_documento, numero_documento, data_emissao, data_vencimento, valor, status, observacao, arquivo)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        veiculo_id,
        tipo_documento,
        numero_documento || null,
        data_emissao || null,
        data_vencimento,
        valor || 0.0,
        status || 'PENDENTE',
        observacao || null,
        arquivo,
      ],
    );

    res
      .status(201)
      .json({
        id: result.insertId,
        mensagem: 'Documento cadastrado com sucesso!',
      });
  } catch (err) {
    console.error('Erro ao cadastrar documento:', err);
    res.status(500).json({ erro: 'Erro ao cadastrar documento.' });
  }
};

exports.updateDocumento = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      veiculo_id,
      tipo_documento,
      numero_documento,
      data_emissao,
      data_vencimento,
      valor,
      status,
      observacao,
    } = req.body;

    // Busca documento anterior para apagar o arquivo antigo se houver novo upload
    const [existing] = await db.execute(
      'SELECT arquivo FROM documentos_veiculos WHERE id = ?',
      [id],
    );
    let arquivo = existing[0]?.arquivo || null;

    if (req.file) {
      if (arquivo) {
        const caminhoAntigo = path.join(__dirname, '..', '..', arquivo);
        if (fs.existsSync(caminhoAntigo)) fs.unlinkSync(caminhoAntigo);
      }
      arquivo = `/uploads/${req.file.filename}`;
    }

    await db.execute(
      `UPDATE documentos_veiculos SET veiculo_id = ?, tipo_documento = ?, numero_documento = ?, data_emissao = ?, data_vencimento = ?, valor = ?, status = ?, observacao = ?, arquivo = ? WHERE id = ?`,
      [
        veiculo_id,
        tipo_documento,
        numero_documento || null,
        data_emissao || null,
        data_vencimento,
        valor || 0.0,
        status || 'PENDENTE',
        observacao || null,
        arquivo,
        id,
      ],
    );

    res.json({ mensagem: 'Documento atualizado com sucesso!' });
  } catch (err) {
    console.error('Erro ao atualizar documento:', err);
    res.status(500).json({ erro: 'Erro ao atualizar documento.' });
  }
};

exports.deleteDocumento = async (req, res) => {
  try {
    const { id } = req.params;
    const [existing] = await db.execute(
      'SELECT arquivo FROM documentos_veiculos WHERE id = ?',
      [id],
    );
    const arquivo = existing[0]?.arquivo;

    if (arquivo) {
      const caminhoArquivo = path.join(__dirname, '..', '..', arquivo);
      if (fs.existsSync(caminhoArquivo)) fs.unlinkSync(caminhoArquivo);
    }

    await db.execute('DELETE FROM documentos_veiculos WHERE id = ?', [id]);
    res.json({ mensagem: 'Documento excluído com sucesso!' });
  } catch (err) {
    console.error('Erro ao excluir documento:', err);
    res.status(500).json({ erro: 'Erro ao excluir documento.' });
  }
};
