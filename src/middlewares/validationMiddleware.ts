import type { NextFunction, Request, Response } from 'express';
import type { ZodTypeAny } from 'zod';
import { ZodError } from 'zod';
import { AppError } from './errorMiddleware.js';

type ValidationSource = 'body' | 'params' | 'query';

function formatIssues(error: ZodError) {
  return error.issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
  }));
}

export const validate = (schema: ZodTypeAny, source: ValidationSource) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      return next(new AppError('Dados inválidos.', 400, formatIssues(result.error)));
    }

    req[source] = result.data;
    return next();
  };
};
