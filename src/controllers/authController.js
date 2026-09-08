// Importa a conexão configurada com o banco MySQL
const db = require('../config/db');

// Importa o bcrypt para realizar a criptografia (hash) de senhas
const bcrypt = require('bcrypt');

// Importa o jsonwebtoken para gerar os tokens de sessão após o login
const jwt = require('jsonwebtoken');

// FUNÇÃO 1: CADASTRAR NOVO USUÁRIO
exports.cadastrar = async (req, res) => {
  // Extrai os campos enviados no corpo (body) do JSON da requisição
  const { nome, email, senha, nivel_acesso } = req.body;

  try {
    // Consulta no banco de dados se já existe algum usuário cadastrado com esse e-mail
    const [existente] = await db.query(
      'SELECT * FROM usuarios WHERE email = ?',
      [email],
    );

    // Se a consulta retornar algum registro, bloqueia o cadastro para evitar e-mails duplicados
    if (existente.length > 0) {
      return res.status(400).json({ mensagem: 'E-mail já cadastrado.' });
    }

    // Criptografa a senha plana recebida antes de salvar no banco (o número 10 indica o nível do algoritmo de hash)
    const senhaHash = await bcrypt.hash(senha, 10);

    // Insere o novo usuário na tabela "usuarios" com a senha devidamente criptografada
    await db.query(
      'INSERT INTO usuarios (nome, email, senha, nivel_acesso) VALUES (?, ?, ?, ?)',
      [nome, email, senhaHash, nivel_acesso || 'MOTORISTA'],
    );

    // Retorna o status 201 (Criado) confirmando o sucesso do cadastro
    res.status(201).json({ mensagem: 'Usuário cadastrado com sucesso!' });
  } catch (err) {
    // Em caso de falha de conexão ou erro no banco, retorna status 500 (Erro no Servidor)
    res.status(500).json({ mensagem: 'Erro no servidor.', erro: err.message });
  }
};

// FUNÇÃO 2: LOGAR NO SISTEMA
exports.login = async (req, res) => {
  // Extrai o e-mail e a senha informados pelo usuário na tela de login
  const { email, senha } = req.body;

  try {
    // Busca no banco o usuário referente ao e-mail digitado
    const [usuarios] = await db.query(
      'SELECT * FROM usuarios WHERE email = ?',
      [email],
    );

    // Se não encontrar nenhum registro, retorna mensagem genérica por questões de segurança
    if (usuarios.length === 0) {
      return res.status(400).json({ mensagem: 'Credenciais inválidas.' });
    }

    // Pega os dados do usuário encontrado
    const usuario = usuarios[0];

    // Compara a senha digitada no login com a senha criptografada armazenada no banco
    const senhaValida = await bcrypt.compare(senha, usuario.senha);

    // Se a comparação falhar (senhas não batem), rejeita o acesso
    if (!senhaValida) {
      return res.status(400).json({ mensagem: 'Credenciais inválidas.' });
    }

    // Se a senha for válida, gera o token JWT assinado contendo os dados básicos do usuário
    const token = jwt.sign(
      { id: usuario.id, nivel: usuario.nivel_acesso },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }, // O token expira em 8 horas
    );

    // Retorna a resposta ao cliente com a mensagem, o token gerado e o perfil do usuário
    res.json({
      mensagem: 'Login realizado com sucesso!',
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        nivel: usuario.nivel_acesso,
      },
    });
  } catch (err) {
    res.status(500).json({ mensagem: 'Erro no servidor.', erro: err.message });
  }
};
