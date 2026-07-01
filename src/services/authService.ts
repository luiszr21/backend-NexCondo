import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';
import { env } from '../config/env.js';
import type { PerfilUsuario } from '@prisma/client';

type RegisterInput = {
  nome: string;
  email: string;
  senha: string;
  telefone?: string;
  perfil?: PerfilUsuario;
};

type LoginInput = {
  email: string;
  senha: string;
};

type ForgotPasswordInput = {
  email: string;
};

type ResetPasswordInput = {
  token: string;
  novaSenha: string;
};

const SALT_ROUNDS = 10;

export class AuthService {
  async register(data: RegisterInput) {
    const existingUser = await prisma.usuario.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error('E-mail já cadastrado.');
    }

    const senhaHash = await bcrypt.hash(data.senha, SALT_ROUNDS);

    const usuario = await prisma.usuario.create({
      data: {
        nome: data.nome,
        email: data.email,
        senhaHash,
        perfil: data.perfil ?? 'MORADOR',
        ...(data.telefone ? { telefone: data.telefone } : {}),
      },
      select: {
        id: true,
        nome: true,
        email: true,
        perfil: true,
        ativo: true,
        criadoEm: true,
      },
    });

    return usuario;
  }

  async login(data: LoginInput) {
    const usuario = await prisma.usuario.findUnique({
      where: { email: data.email },
    });

    if (!usuario || !usuario.ativo) {
      throw new Error('Credenciais inválidas.');
    }

    const senhaValida = await bcrypt.compare(data.senha, usuario.senhaHash);

    if (!senhaValida) {
      throw new Error('Credenciais inválidas.');
    }

    const token = jwt.sign(
      { sub: usuario.id, email: usuario.email, perfil: usuario.perfil },
      env.jwtSecret as string,
      { expiresIn: env.jwtExpiresIn as NonNullable<jwt.SignOptions['expiresIn']> },
    );

    return {
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil,
      },
    };
  }

  async forgotPassword(data: ForgotPasswordInput) {
    const usuario = await prisma.usuario.findUnique({
      where: { email: data.email },
    });

    if (!usuario) {
      throw new Error('Usuário não encontrado.');
    }

    const token = jwt.sign(
      { sub: usuario.id, purpose: 'password-reset' },
      env.jwtSecret as string,
      { expiresIn: '1h' as NonNullable<jwt.SignOptions['expiresIn']> },
    );

    return { message: 'Token de recuperação gerado.', token };
  }

  async resetPassword(data: ResetPasswordInput) {
    try {
      const decoded = jwt.verify(data.token, env.jwtSecret) as { sub?: string; purpose?: string };

      if (decoded.purpose !== 'password-reset' || !decoded.sub) {
        throw new Error('Token inválido.');
      }

      const senhaHash = await bcrypt.hash(data.novaSenha, SALT_ROUNDS);

      await prisma.usuario.update({
        where: { id: decoded.sub },
        data: { senhaHash },
      });

      return { message: 'Senha redefinida com sucesso.' };
    } catch {
      throw new Error('Token inválido ou expirado.');
    }
  }
}

export const authService = new AuthService();
