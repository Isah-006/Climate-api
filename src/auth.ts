import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      usuarioId?: number;
    }
  }
}

export function autorizarUsuario(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      erro: 'Token não fornecido.',
    });
  }

  const parts = authHeader.split(' ');

  if (parts.length !== 2) {
    return res.status(401).json({
      erro: 'Erro no formato do token.',
    });
  }

  const [scheme, token] = parts;

  if (!/^Bearer$/i.test(scheme)) {
    return res.status(401).json({
      erro: 'Token mal formatado.',
    });
  }

  jwt.verify(
    token,
    'senha_secreta_da_faculdade',
    (err, decoded: any) => {
      if (err) {
        return res.status(401).json({
          erro: 'Token inválido ou expirado.',
        });
      }

      req.usuarioId = decoded.id;

      return next();
    }
  );
}