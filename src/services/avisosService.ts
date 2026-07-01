import { StatusAviso } from '@prisma/client';
import { prisma } from '../lib/prisma.js';

type CreateAvisoInput = {
  titulo: string;
  descricao: string;
  categoria: string;
  expiraEm: string;
  publicadoEm?: string;
};

type UpdateAvisoInput = Partial<CreateAvisoInput>;

function parseDate(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error('Data inválida.');
  }
  return parsed;
}

export class AvisosService {
  async create(authorId: string, data: CreateAvisoInput) {
    if (!data.titulo?.trim()) throw new Error('Título é obrigatório.');
    if (!data.descricao?.trim()) throw new Error('Descrição é obrigatória.');
    if (!data.categoria?.trim()) throw new Error('Categoria é obrigatória.');
    if (!data.expiraEm) throw new Error('Data de expiração é obrigatória.');

    const publicadoEm = data.publicadoEm ? parseDate(data.publicadoEm) : new Date();
    const expiraEm = parseDate(data.expiraEm);

    if (expiraEm <= publicadoEm) {
      throw new Error('A data de expiração deve ser posterior à data de publicação.');
    }

    const autor = await prisma.usuario.findUnique({ where: { id: authorId } });
    if (!autor || !autor.ativo) {
      throw new Error('Autor não encontrado ou inativo.');
    }

    const aviso = await prisma.aviso.create({
      data: {
        titulo: data.titulo.trim(),
        descricao: data.descricao.trim(),
        categoria: data.categoria.trim(),
        autorId: authorId,
        status: StatusAviso.ATIVO,
        publicadoEm,
        expiraEm,
      },
      select: {
        id: true,
        titulo: true,
        descricao: true,
        categoria: true,
        status: true,
        publicadoEm: true,
        expiraEm: true,
        criadoEm: true,
        atualizadoEm: true,
        autor: {
          select: {
            id: true,
            nome: true,
            email: true,
            perfil: true,
          },
        },
      },
    });

    return aviso;
  }

  async update(id: string, data: UpdateAvisoInput) {
    const avisoAtual = await prisma.aviso.findUnique({ where: { id } });
    if (!avisoAtual) throw new Error('Aviso não encontrado.');

    const publicadoEm = data.publicadoEm ? parseDate(data.publicadoEm) : avisoAtual.publicadoEm;
    const expiraEm = data.expiraEm ? parseDate(data.expiraEm) : avisoAtual.expiraEm;

    if (expiraEm <= publicadoEm) {
      throw new Error('A data de expiração deve ser posterior à data de publicação.');
    }

    const aviso = await prisma.aviso.update({
      where: { id },
      data: {
        ...(data.titulo ? { titulo: data.titulo.trim() } : {}),
        ...(data.descricao ? { descricao: data.descricao.trim() } : {}),
        ...(data.categoria ? { categoria: data.categoria.trim() } : {}),
        ...(data.publicadoEm ? { publicadoEm } : {}),
        ...(data.expiraEm ? { expiraEm } : {}),
      },
      select: {
        id: true,
        titulo: true,
        descricao: true,
        categoria: true,
        status: true,
        publicadoEm: true,
        expiraEm: true,
        criadoEm: true,
        atualizadoEm: true,
        autor: {
          select: {
            id: true,
            nome: true,
            email: true,
            perfil: true,
          },
        },
      },
    });

    return aviso;
  }

  async list() {
    const now = new Date();

    const avisos = await prisma.aviso.findMany({
      where: {
        status: StatusAviso.ATIVO,
        publicadoEm: { lte: now },
        expiraEm: { gte: now },
      },
      orderBy: { publicadoEm: 'desc' },
      select: {
        id: true,
        titulo: true,
        descricao: true,
        categoria: true,
        status: true,
        publicadoEm: true,
        expiraEm: true,
        criadoEm: true,
        atualizadoEm: true,
        autor: {
          select: {
            id: true,
            nome: true,
            email: true,
            perfil: true,
          },
        },
      },
    });

    return avisos;
  }

  async getById(id: string) {
    const aviso = await prisma.aviso.findUnique({
      where: { id },
      select: {
        id: true,
        titulo: true,
        descricao: true,
        categoria: true,
        status: true,
        publicadoEm: true,
        expiraEm: true,
        criadoEm: true,
        atualizadoEm: true,
        autor: {
          select: {
            id: true,
            nome: true,
            email: true,
            perfil: true,
          },
        },
      },
    });

    if (!aviso) {
      throw new Error('Aviso não encontrado.');
    }

    return aviso;
  }

  async delete(id: string) {
    const aviso = await prisma.aviso.findUnique({ where: { id } });
    if (!aviso) throw new Error('Aviso não encontrado.');

    if (aviso.status === StatusAviso.INATIVO) {
      throw new Error('Aviso já está inativo.');
    }

    const updated = await prisma.aviso.update({
      where: { id },
      data: { status: StatusAviso.INATIVO },
      select: {
        id: true,
        status: true,
        atualizadoEm: true,
      },
    });

    return { message: 'Aviso removido com sucesso.', aviso: updated };
  }
}

export const avisosService = new AvisosService();
