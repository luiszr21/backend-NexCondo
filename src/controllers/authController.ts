import type { NextFunction, Request, Response } from 'express';
import { authService } from '../services/authService.js';
import { AppError } from '../middlewares/errorMiddleware.js';

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const usuario = await authService.register(req.body);
      return res.status(201).json(usuario);
    } catch (error) {
      return next(error instanceof AppError ? error : new AppError(error instanceof Error ? error.message : 'Erro ao cadastrar usuário.', 400));
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.login(req.body);
      return res.status(200).json(result);
    } catch (error) {
      return next(error instanceof AppError ? error : new AppError(error instanceof Error ? error.message : 'Erro ao fazer login.', 401));
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.forgotPassword(req.body);
      return res.status(200).json(result);
    } catch (error) {
      return next(error instanceof AppError ? error : new AppError(error instanceof Error ? error.message : 'Erro ao recuperar senha.', 400));
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.resetPassword(req.body);
      return res.status(200).json(result);
    } catch (error) {
      return next(error instanceof AppError ? error : new AppError(error instanceof Error ? error.message : 'Erro ao redefinir senha.', 400));
    }
  }

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return next(new AppError('Não autenticado.', 401));
      }

      return res.status(200).json({ user: req.user });
    } catch (error) {
      return next(error instanceof AppError ? error : new AppError('Erro ao consultar usuário autenticado.', 400));
    }
  }
}

export const authController = new AuthController();
