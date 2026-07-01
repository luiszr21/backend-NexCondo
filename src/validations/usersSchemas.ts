import { z } from 'zod';
import { cuidSchema } from './commonSchemas.js';

export const updateUserProfileSchema = z.object({
  nome: z.string().trim().min(1, { message: 'Nome é obrigatório.' }).optional(),
  telefone: z.string().trim().min(8, { message: 'Telefone inválido.' }).optional(),
  senha: z.string().min(8, { message: 'A senha deve ter no mínimo 8 caracteres.' }).optional(),
}).refine((data) => Object.values(data).some((value) => value !== undefined), {
  message: 'Informe ao menos um campo para atualização.',
});

export const userIdParamsSchema = z.object({
  id: cuidSchema,
});
