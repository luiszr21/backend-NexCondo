import { z } from 'zod';
import { cuidSchema, datetimeStringSchema } from './commonSchemas.js';

const baseAvisoSchema = z.object({
  titulo: z.string().trim().min(1, { message: 'Título é obrigatório.' }),
  descricao: z.string().trim().min(1, { message: 'Descrição é obrigatória.' }),
  categoria: z.string().trim().min(1, { message: 'Categoria é obrigatória.' }),
  publicadoEm: datetimeStringSchema.optional(),
  expiraEm: datetimeStringSchema,
});

export const createAvisoSchema = baseAvisoSchema;

export const updateAvisoSchema = baseAvisoSchema.partial().refine((data) => Object.values(data).some((value) => value !== undefined), {
  message: 'Informe ao menos um campo para atualização.',
});

export const avisoIdParamsSchema = z.object({
  id: cuidSchema,
});
