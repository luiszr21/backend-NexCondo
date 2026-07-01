import { z } from 'zod';
import { cuidSchema } from './commonSchemas.js';

const statusEncomendaSchema = z.enum(['PENDENTE', 'RECEBIDA', 'ENTREGUE', 'DEVOLVIDA']);

export const createEncomendaSchema = z.object({
  codigoRastreio: z.string().trim().min(1, { message: 'Código de rastreio inválido.' }).optional(),
  descricao: z.string().trim().min(1, { message: 'Descrição é obrigatória.' }),
  destinatarioId: cuidSchema,
  observacoes: z.string().trim().optional(),
});

export const updateEncomendaStatusSchema = z.object({
  status: statusEncomendaSchema,
});

export const encomendaIdParamsSchema = z.object({
  id: cuidSchema,
});
