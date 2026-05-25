import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Esta interface serve para avisar o TypeScript que vamos guardar o ID do usuário dentro da requisição
declare global {
  namespace Express {
    interface Request {
      usuarioId?: number;
    }
  }
}

export function autorizarUsuario(req: Request, res: Response, next: NextFunction) {
  // 1. Procura o Token no cabeçalho (Header) da requisição
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ erro: 'Token não fornecido.' });
  }

  // O token geralmente vem no formato "Bearer TOKEN_AQUI", vamos dividir e pegar só o token
  const parts = authHeader.split(' ');
  if (parts.length !== 2) {
    return res.status(401).json({ erro: 'Erro no formato do Token.' });
  }

  const [scheme, token] = parts;

  if (!/^Bearer$/i.test(scheme)) {
    return res.status(401).json({ erro: 'Token malformado.' });
  }

  // 2. Valida se o Token é verdadeiro e não expirou
  jwt.verify(token, 'senha_secreta_da_faculdade', (err, decoded: any) => {
    if (err) {
      return res.status(401).json({ erro: 'Token inválido ou expirado.' });
    }

    // Se o token for válido, guarda o ID do usuário dentro da requisição para as próximas funções usarem
    req.usuarioId = decoded.id;
    return next(); // Deixa o usuário passar para a rota do clima
  });
}