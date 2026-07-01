import { z } from 'zod';
import { cuidSchema } from './commonSchemas.js';

const baseAreaSchema = z.object({
  nome: z.string().trim().min(1, { message: 'Nome é obrigatório.' }),
  descricao: z.string().trim().optional(),
  capacidade: z.coerce.number().int().positive({ message: 'Capacidade deve ser maior que zero.' }).optional(),
  localizacao: z.string().trim().optional(),
  regras: z.string().trim().optional(),
});

export const createAreaSchema = baseAreaSchema;

export const updateAreaSchema = baseAreaSchema.partial().refine((data) => Object.values(data).some((value) => value !== undefined), {
  message: 'Informe ao menos um campo para atualização.',
});

export const areaIdParamsSchema = z.object({
  id: cuidSchema,
});
