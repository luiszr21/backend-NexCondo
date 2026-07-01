import { prisma } from '../lib/prisma.js';

function isPrismaUniqueConstraintError(error: unknown) {
  return typeof error === 'object' && error !== null && 'code' in error && (error as { code?: string }).code === 'P2002';
}

type CreateAreaInput = {
  nome: string;
  descricao?: string;
  capacidade?: number;
  localizacao?: string;
  regras?: string;
};

type UpdateAreaInput = Partial<CreateAreaInput>;

export class AreasService {
  async create(data: CreateAreaInput) {
    try {
      const createData = {
        nome: data.nome,
        ...(data.descricao !== undefined ? { descricao: data.descricao } : {}),
        ...(data.capacidade !== undefined ? { capacidade: data.capacidade } : {}),
        ...(data.localizacao !== undefined ? { localizacao: data.localizacao } : {}),
        ...(data.regras !== undefined ? { regras: data.regras } : {}),
      };

      const area = await prisma.areaComum.create({
        data: createData,
        select: {
          id: true,
          nome: true,
          descricao: true,
          capacidade: true,
          localizacao: true,
          regras: true,
          ativo: true,
          criadoEm: true,
          atualizadoEm: true,
        },
      });

      return area;
    } catch (error: unknown) {
      if (isPrismaUniqueConstraintError(error)) {
        throw new Error('Já existe uma área comum com esse nome.');
      }
      throw new Error('Erro ao criar área comum.');
    }
  }

  async update(id: string, data: UpdateAreaInput) {
    const existing = await prisma.areaComum.findUnique({ where: { id } });
    if (!existing) throw new Error('Área comum não encontrada.');

    try {
      const area = await prisma.areaComum.update({
        where: { id },
        data: {
          ...(data.nome !== undefined ? { nome: data.nome } : {}),
          ...(data.descricao !== undefined ? { descricao: data.descricao } : {}),
          ...(data.capacidade !== undefined ? { capacidade: data.capacidade } : {}),
          ...(data.localizacao !== undefined ? { localizacao: data.localizacao } : {}),
          ...(data.regras !== undefined ? { regras: data.regras } : {}),
        },
        select: {
          id: true,
          nome: true,
          descricao: true,
          capacidade: true,
          localizacao: true,
          regras: true,
          ativo: true,
          criadoEm: true,
          atualizadoEm: true,
        },
      });

      return area;
    } catch (error: unknown) {
      if (isPrismaUniqueConstraintError(error)) {
        throw new Error('Já existe uma área comum com esse nome.');
      }
      throw new Error('Erro ao atualizar área comum.');
    }
  }

  async list() {
    const areas = await prisma.areaComum.findMany({
      where: {},
      select: {
        id: true,
        nome: true,
        descricao: true,
        capacidade: true,
        localizacao: true,
        regras: true,
        ativo: true,
        criadoEm: true,
        atualizadoEm: true,
      },
      orderBy: { criadoEm: 'desc' },
    });

    return areas;
  }

  async delete(id: string) {
    const existing = await prisma.areaComum.findUnique({ where: { id } });
    if (!existing) throw new Error('Área comum não encontrada.');

    // Verificar reservas associadas (evita remover área em uso)
    const reservasCount = await prisma.reserva.count({ where: { areaComumId: id } });
    if (reservasCount > 0) {
      throw new Error('Não é possível excluir área com reservas associadas.');
    }

    const updated = await prisma.areaComum.update({ where: { id }, data: { ativo: false } });

    return { message: 'Área comum removida com sucesso.', area: { id: updated.id, ativo: updated.ativo } };
  }
}

export const areasService = new AreasService();
