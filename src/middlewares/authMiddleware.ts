import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { prisma } from '../lib/prisma.js';
import { AppError } from './errorMiddleware.js';

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      return next(new AppError('Token não fornecido.', 401));
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, env.jwtSecret);

    if (typeof decoded === 'string' || !decoded.sub) {
      return next(new AppError('Token inválido.', 401));
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id: decoded.sub },
    });

    if (!usuario || !usuario.ativo) {
      return next(new AppError('Usuário não encontrado ou inativo.', 401));
    }

    req.user = {
      id: usuario.id,
      email: usuario.email,
      perfil: usuario.perfil,
    };

    return next();
  } catch {
    return next(new AppError('Token inválido ou expirado.', 401));
  }
};

export const authorize = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      return next(new AppError('Não autenticado.', 401));
    }

    if (!allowedRoles.includes(user.perfil)) {
      return next(new AppError('Acesso negado.', 403));
    }

    return next();
  };
};
