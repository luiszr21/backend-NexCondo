import { z } from 'zod';

const perfilUsuarioSchema = z.enum(['ADMINISTRADOR', 'FUNCIONARIO', 'MORADOR']);

export const registerAuthSchema = z.object({
  nome: z.string().trim().min(1, { message: 'Nome é obrigatório.' }),
  email: z.string().trim().email({ message: 'E-mail inválido.' }),
  senha: z.string().min(8, { message: 'A senha deve ter no mínimo 8 caracteres.' }),
  telefone: z.string().trim().min(8).optional(),
  perfil: perfilUsuarioSchema.optional(),
});

export const loginAuthSchema = z.object({
  email: z.string().trim().email({ message: 'E-mail inválido.' }),
  senha: z.string().min(1, { message: 'Senha é obrigatória.' }),
});

export const forgotPasswordAuthSchema = z.object({
  email: z.string().trim().email({ message: 'E-mail inválido.' }),
});

export const resetPasswordAuthSchema = z.object({
  token: z.string().trim().min(1, { message: 'Token é obrigatório.' }),
  novaSenha: z.string().min(8, { message: 'A nova senha deve ter no mínimo 8 caracteres.' }),
});
