import type { PerfilUsuario } from '@prisma/client';

declare global {
  namespace Express {
    interface UserContext {
      id: string;
      email: string;
      perfil: PerfilUsuario;
    }

    interface Request {
      user?: UserContext;
    }
  }
}

export {};
