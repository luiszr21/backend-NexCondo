import type { NextFunction, Request, Response } from 'express';
import { usersService } from '../services/usersService.js';
import { AppError } from '../middlewares/errorMiddleware.js';

export class UsersController {
  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user;
      if (!user) {
        return next(new AppError('Não autenticado.', 401));
      }
      const result = await usersService.getProfile(user.id);
      return res.status(200).json(result);
    } catch (error) {
      return next(error instanceof AppError ? error : new AppError(error instanceof Error ? error.message : 'Erro ao obter perfil.', 400));
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user;
      if (!user) {
        return next(new AppError('Não autenticado.', 401));
      }
      const payload = req.body;
      const result = await usersService.updateProfile(user.id, payload);
      return res.status(200).json(result);
    } catch (error) {
      return next(error instanceof AppError ? error : new AppError(error instanceof Error ? error.message : 'Erro ao atualizar perfil.', 400));
    }
  }

  async listUsers(_req: Request, res: Response, next: NextFunction) {
    try {
      const result = await usersService.listUsers();
      return res.status(200).json(result);
    } catch (error) {
      return next(error instanceof AppError ? error : new AppError(error instanceof Error ? error.message : 'Erro ao listar usuários.', 400));
    }
  }

  async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user;
      if (!user) {
        return next(new AppError('Não autenticado.', 401));
      }
      const { id } = req.params as { id: string };
      const result = await usersService.deleteUser(user.id, user.perfil, id);
      return res.status(200).json(result);
    } catch (error) {
      return next(error instanceof AppError ? error : new AppError(error instanceof Error ? error.message : 'Erro ao excluir usuário.', 400));
    }
  }
}

export const usersController = new UsersController();
