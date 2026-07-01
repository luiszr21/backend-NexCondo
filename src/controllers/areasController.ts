import type { NextFunction, Request, Response } from 'express';
import { areasService } from '../services/areasService.js';
import { AppError } from '../middlewares/errorMiddleware.js';

export class AreasController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = req.body;
      const result = await areasService.create(payload);
      return res.status(201).json(result);
    } catch (error) {
      return next(error instanceof AppError ? error : new AppError(error instanceof Error ? error.message : 'Erro ao criar área comum.', 400));
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params as { id: string };
      const payload = req.body;
      const result = await areasService.update(id, payload);
      return res.status(200).json(result);
    } catch (error) {
      return next(error instanceof AppError ? error : new AppError(error instanceof Error ? error.message : 'Erro ao atualizar área comum.', 400));
    }
  }

  async list(_req: Request, res: Response, next: NextFunction) {
    try {
      const result = await areasService.list();
      return res.status(200).json(result);
    } catch (error) {
      return next(error instanceof AppError ? error : new AppError(error instanceof Error ? error.message : 'Erro ao listar áreas comuns.', 400));
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params as { id: string };
      const result = await areasService.delete(id);
      return res.status(200).json(result);
    } catch (error) {
      return next(error instanceof AppError ? error : new AppError(error instanceof Error ? error.message : 'Erro ao excluir área comum.', 400));
    }
  }
}

export const areasController = new AreasController();
