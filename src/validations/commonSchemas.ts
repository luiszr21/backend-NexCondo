import { z } from 'zod';

export const cuidSchema = z.string().cuid({ message: 'ID inválido.' });

export const datetimeStringSchema = z.string().datetime({ message: 'Data/hora inválida.' });

export const dateStringSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
  message: 'Data inválida. Use o formato YYYY-MM-DD.',
});

export const positiveIntegerSchema = z.coerce.number().int().positive({ message: 'Deve ser um número maior que zero.' });

export const nonEmptyTrimmedStringSchema = z.string().trim().min(1, { message: 'Campo obrigatório.' });
