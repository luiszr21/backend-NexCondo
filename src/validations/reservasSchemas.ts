import { z } from 'zod';
import { cuidSchema, dateStringSchema, datetimeStringSchema, positiveIntegerSchema } from './commonSchemas.js';

export const createReservaSchema = z.object({
  areaComumId: cuidSchema,
  dataInicio: datetimeStringSchema,
  dataFim: datetimeStringSchema,
  observacoes: z.string().trim().optional(),
});

export const reservaIdParamsSchema = z.object({
  id: cuidSchema,
});

export const availableSlotsQuerySchema = z.object({
  areaComumId: cuidSchema,
  data: dateStringSchema,
  duracaoMinutos: positiveIntegerSchema.optional(),
});
