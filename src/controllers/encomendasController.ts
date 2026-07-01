import type { NextFunction, Request, Response } from 'express';
import { encomendasService } from '../services/encomendasService.js';
import { AppError } from '../middlewares/errorMiddleware.js';

export class EncomendasController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user;
      if (!user) {
        return next(new AppError('Não autenticado.', 401));
      }
      const result = await encomendasService.create(user.id, req.body);
      return res.status(201).json(result);
    } catch (error) {
      return next(error instanceof AppError ? error : new AppError(error instanceof Error ? error.message : 'Erro ao registrar encomenda.', 400));
    }
  }

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user;
      if (!user) {
        return next(new AppError('Não autenticado.', 401));
      }
      const result = await encomendasService.listForUser(user.id, user.perfil);
      return res.status(200).json(result);
    } catch (error) {
      return next(error instanceof AppError ? error : new AppError(error instanceof Error ? error.message : 'Erro ao listar encomendas.', 400));
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user;
      if (!user) {
        return next(new AppError('Não autenticado.', 401));
      }
      const { id } = req.params as { id: string };
      const result = await encomendasService.getById(user.id, user.perfil, id);
      return res.status(200).json(result);
    } catch (error) {
      return next(error instanceof AppError ? error : new AppError(error instanceof Error ? error.message : 'Erro ao consultar encomenda.', 400));
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user;
      if (!user) {
        return next(new AppError('Não autenticado.', 401));
      }
      const { id } = req.params as { id: string };
      const result = await encomendasService.updateStatus(user.id, user.perfil, id, req.body);
      return res.status(200).json(result);
    } catch (error) {
      return next(error instanceof AppError ? error : new AppError(error instanceof Error ? error.message : 'Erro ao atualizar status da encomenda.', 400));
    }
  }
}

export const encomendasController = new EncomendasController();
