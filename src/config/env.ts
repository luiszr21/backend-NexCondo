import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  JWT_SECRET: z.string().min(1).optional(),
  JWT_EXPIRES_IN: z.string().min(1).default('7d'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  throw new Error(`Variáveis de ambiente inválidas: ${parsed.error.issues.map((issue) => issue.message).join('; ')}`);
}

export const env = {
  nodeEnv: parsed.data.NODE_ENV,
  port: parsed.data.PORT,
  jwtSecret: parsed.data.JWT_SECRET ?? (parsed.data.NODE_ENV === 'production' ? '' : 'dev-secret'),
  jwtExpiresIn: parsed.data.JWT_EXPIRES_IN,
};

if (env.nodeEnv === 'production' && !env.jwtSecret) {
  throw new Error('JWT_SECRET é obrigatório em produção.');
}
