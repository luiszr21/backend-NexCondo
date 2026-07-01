import type { NextFunction, Request, Response } from 'express';
import { avisosService } from '../services/avisosService.js';
import { AppError } from '../middlewares/errorMiddleware.js';

export class AvisosController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user;
      if (!user) {
        return next(new AppError('Não autenticado.', 401));
      }
      const result = await avisosService.create(user.id, req.body);
      return res.status(201).json(result);
    } catch (error) {
      return next(error instanceof AppError ? error : new AppError(error instanceof Error ? error.message : 'Erro ao criar aviso.', 400));
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params as { id: string };
      const result = await avisosService.update(id, req.body);
      return res.status(200).json(result);
    } catch (error) {
      return next(error instanceof AppError ? error : new AppError(error instanceof Error ? error.message : 'Erro ao atualizar aviso.', 400));
    }
  }

  async list(_req: Request, res: Response, next: NextFunction) {
    try {
      const result = await avisosService.list();
      return res.status(200).json(result);
    } catch (error) {
      return next(error instanceof AppError ? error : new AppError(error instanceof Error ? error.message : 'Erro ao listar avisos.', 400));
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params as { id: string };
      const result = await avisosService.getById(id);
      return res.status(200).json(result);
    } catch (error) {
      return next(error instanceof AppError ? error : new AppError(error instanceof Error ? error.message : 'Erro ao consultar aviso.', 400));
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params as { id: string };
      const result = await avisosService.delete(id);
      return res.status(200).json(result);
    } catch (error) {
      return next(error instanceof AppError ? error : new AppError(error instanceof Error ? error.message : 'Erro ao excluir aviso.', 400));
    }
  }
}

export const avisosController = new AvisosController();
