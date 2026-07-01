import bcrypt from 'bcrypt';
import { prisma } from '../lib/prisma.js';
import type { PerfilUsuario } from '@prisma/client';

type UpdateProfileInput = {
  nome?: string;
  telefone?: string;
  senha?: string;
};

const SALT_ROUNDS = 10;

export class UsersService {
  async getProfile(userId: string) {
    const usuario = await prisma.usuario.findUnique({
      where: { id: userId },
      select: {
        id: true,
        nome: true,
        email: true,
        telefone: true,
        perfil: true,
        ativo: true,
        criadoEm: true,
        atualizadoEm: true,
      },
    });

    if (!usuario) throw new Error('Usuário não encontrado.');

    return usuario;
  }

  async updateProfile(userId: string, data: UpdateProfileInput) {
    const updateData: Partial<{
      nome: string;
      telefone: string | null;
      senhaHash: string;
    }> = {};

    if (data.nome) updateData.nome = data.nome;
    if (data.telefone !== undefined) updateData.telefone = data.telefone;
    if (data.senha) {
      const senhaHash = await bcrypt.hash(data.senha, SALT_ROUNDS);
      updateData.senhaHash = senhaHash;
    }

    const usuario = await prisma.usuario.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        nome: true,
        email: true,
        telefone: true,
        perfil: true,
        ativo: true,
        criadoEm: true,
        atualizadoEm: true,
      },
    });

    return usuario;
  }

  async listUsers() {
    const usuarios = await prisma.usuario.findMany({
      where: {},
      select: {
        id: true,
        nome: true,
        email: true,
        telefone: true,
        perfil: true,
        ativo: true,
        criadoEm: true,
        atualizadoEm: true,
      },
      orderBy: { criadoEm: 'desc' },
    });

    return usuarios;
  }

  async deleteUser(requesterId: string, requesterPerfil: PerfilUsuario | string, targetId: string) {
    const usuario = await prisma.usuario.findUnique({ where: { id: targetId } });

    if (!usuario) throw new Error('Usuário não encontrado.');

    const isAdminRequester = requesterPerfil === 'ADMINISTRADOR';
    const isSelf = requesterId === targetId;

    if (!isAdminRequester && !isSelf) {
      throw new Error('Ação não autorizada.');
    }

    // Prevent deleting the last active administrator
    if (usuario.perfil === 'ADMINISTRADOR') {
      const adminCount = await prisma.usuario.count({ where: { perfil: 'ADMINISTRADOR', ativo: true } });
      if (adminCount <= 1) {
        throw new Error('Não é possível excluir o último administrador ativo.');
      }
    }

    // Soft delete: marcar como inativo
    const updated = await prisma.usuario.update({ where: { id: targetId }, data: { ativo: false } });

    return { message: 'Usuário removido com sucesso.', usuario: { id: updated.id, ativo: updated.ativo } };
  }
}

export const usersService = new UsersService();
