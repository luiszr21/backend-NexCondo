import type { NextFunction, Request, Response } from 'express';

export class AppError extends Error {
  statusCode: number;
  details: Array<{ path: string; message: string }> | undefined;

  constructor(message: string, statusCode = 400, details?: Array<{ path: string; message: string }>) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

export const notFoundHandler = (_req: Request, _res: Response, next: NextFunction) => {
  next(new AppError('Rota não encontrada.', 404));
};

export const errorHandler = (error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      error: {
        message: error.message,
        statusCode: error.statusCode,
        ...(error.details ? { details: error.details } : {}),
      },
    });
  }

  if (error instanceof Error) {
    return res.status(500).json({
      error: {
        message: 'Erro interno do servidor.',
        statusCode: 500,
      },
    });
  }

  return res.status(500).json({
    error: {
      message: 'Erro interno do servidor.',
      statusCode: 500,
    },
  });
};
