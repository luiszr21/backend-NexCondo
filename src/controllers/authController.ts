import type { Request, Response } from 'express';
import { authService } from '../services/authService.js';

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const usuario = await authService.register(req.body);
      return res.status(201).json(usuario);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao cadastrar usuário.';
      return res.status(400).json({ message });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const result = await authService.login(req.body);
      return res.status(200).json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao fazer login.';
      return res.status(401).json({ message });
    }
  }

  async forgotPassword(req: Request, res: Response) {
    try {
      const result = await authService.forgotPassword(req.body);
      return res.status(200).json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao recuperar senha.';
      return res.status(400).json({ message });
    }
  }

  async resetPassword(req: Request, res: Response) {
    try {
      const result = await authService.resetPassword(req.body);
      return res.status(200).json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao redefinir senha.';
      return res.status(400).json({ message });
    }
  }
}

export const authController = new AuthController();
