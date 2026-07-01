import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { prisma } from '../lib/prisma.js';

type AuthenticatedRequest = Request & {
  user?: {
    id: string;
    email: string;
    perfil: string;
  };
};

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Token não fornecido.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, env.jwtSecret);

    if (typeof decoded === 'string' || !decoded.sub) {
      return res.status(401).json({ message: 'Token inválido.' });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id: decoded.sub },
    });

    if (!usuario || !usuario.ativo) {
      return res.status(401).json({ message: 'Usuário não encontrado ou inativo.' });
    }

    (req as AuthenticatedRequest).user = {
      id: usuario.id,
      email: usuario.email,
      perfil: usuario.perfil,
    };

    return next();
  } catch {
    return res.status(401).json({ message: 'Token inválido ou expirado.' });
  }
};

export const authorize = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as AuthenticatedRequest).user;

    if (!user) {
      return res.status(401).json({ message: 'Não autenticado.' });
    }

    if (!allowedRoles.includes(user.perfil)) {
      return res.status(403).json({ message: 'Acesso negado.' });
    }

    return next();
  };
};
