// Importa a biblioteca jsonwebtoken, usada para verificar a validade dos tokens de segurança
const jwt = require('jsonwebtoken');

// Exporta uma função middleware (interceptador) que roda antes das requisições chegarem ao controller
module.exports = (req, res, next) => {
  // Busca o cabeçalho "authorization" da requisição HTTP (onde o token deve ser enviado)
  const authHeader = req.headers['authorization'];

  // O token normalmente vem no formato "Bearer <TOKEN>".
  // O comando split(' ')[1] separa essa frase pelo espaço e pega apenas a segunda parte (o token puro)
  const token = authHeader && authHeader.split(' ')[1];

  // Se o cliente (front-end) não enviou o token, bloqueia a requisição imediatamente
  if (!token) {
    return res
      .status(401)
      .json({ mensagem: 'Acesso negado. Token não fornecido.' });
  }

  try {
    // Tenta decodificar e verificar o token usando a chave secreta definida no arquivo .env
    const verificado = jwt.verify(token, process.env.JWT_SECRET);

    // Se o token for válido, guarda as informações do usuário (ex: id e nível) dentro da própria requisição
    req.usuario = verificado;

    // Passa a requisição adiante para que o controller final possa responder ao usuário
    next();
  } catch (err) {
    // Se o token for inválido, alterado ou tiver expirado, retorna erro de proibido (403)
    res.status(403).json({ mensagem: 'Token inválido ou expirado.' });
  }
};
