import type { NextFunction, Request, Response } from 'express';
import { reservasService } from '../services/reservasService.js';
import { AppError } from '../middlewares/errorMiddleware.js';

export class ReservasController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user;
      if (!user) {
        return next(new AppError('Não autenticado.', 401));
      }
      const result = await reservasService.create(user.id, req.body);
      return res.status(201).json(result);
    } catch (error) {
      return next(error instanceof AppError ? error : new AppError(error instanceof Error ? error.message : 'Erro ao criar reserva.', 400));
    }
  }

  async cancel(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user;
      if (!user) {
        return next(new AppError('Não autenticado.', 401));
      }
      const { id } = req.params as { id: string };
      const result = await reservasService.cancel(user.id, id);
      return res.status(200).json(result);
    } catch (error) {
      return next(error instanceof AppError ? error : new AppError(error instanceof Error ? error.message : 'Erro ao cancelar reserva.', 400));
    }
  }

  async availableSlots(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query as { areaComumId?: string; data?: string; duracaoMinutos?: string };

      const result = await reservasService.availableSlots({
        areaComumId: String(query.areaComumId ?? ''),
        data: String(query.data ?? ''),
        ...(query.duracaoMinutos ? { duracaoMinutos: Number(query.duracaoMinutos) } : {}),
      });

      return res.status(200).json(result);
    } catch (error) {
      return next(error instanceof AppError ? error : new AppError(error instanceof Error ? error.message : 'Erro ao consultar horários disponíveis.', 400));
    }
  }

  async futureReservations(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user;
      if (!user) {
        return next(new AppError('Não autenticado.', 401));
      }
      const result = await reservasService.futureReservations(user.id);
      return res.status(200).json(result);
    } catch (error) {
      return next(error instanceof AppError ? error : new AppError(error instanceof Error ? error.message : 'Erro ao consultar reservas futuras.', 400));
    }
  }
}

export const reservasController = new ReservasController();
