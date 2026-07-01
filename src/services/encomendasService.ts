import { StatusEncomenda } from '@prisma/client';
import { prisma } from '../lib/prisma.js';

type CreateEncomendaInput = {
  codigoRastreio?: string;
  descricao: string;
  destinatarioId: string;
  observacoes?: string;
};

type UpdateStatusInput = {
  status: StatusEncomenda;
};

function parseStatus(value: string) {
  const allowedStatuses = Object.values(StatusEncomenda);

  if (!allowedStatuses.includes(value as StatusEncomenda)) {
    throw new Error('Status inválido.');
  }

  return value as StatusEncomenda;
}

export class EncomendasService {
  async create(registradaPorId: string, data: CreateEncomendaInput) {
    if (!data.descricao?.trim()) {
      throw new Error('Descrição é obrigatória.');
    }

    if (!data.destinatarioId) {
      throw new Error('Destinatário é obrigatório.');
    }

    const [registrador, destinatario] = await Promise.all([
      prisma.usuario.findUnique({ where: { id: registradaPorId } }),
      prisma.usuario.findUnique({ where: { id: data.destinatarioId } }),
    ]);

    if (!registrador || !registrador.ativo) {
      throw new Error('Usuário registrador não encontrado ou inativo.');
    }

    if (!destinatario || !destinatario.ativo) {
      throw new Error('Destinatário não encontrado ou inativo.');
    }

    if (data.codigoRastreio) {
      const existingTracking = await prisma.encomenda.findUnique({
        where: { codigoRastreio: data.codigoRastreio },
      });

      if (existingTracking) {
        throw new Error('Já existe uma encomenda com esse código de rastreio.');
      }
    }

    const encomenda = await prisma.encomenda.create({
      data: {
        descricao: data.descricao.trim(),
        destinatarioId: data.destinatarioId,
        registradaPorId,
        ...(data.codigoRastreio ? { codigoRastreio: data.codigoRastreio.trim() } : {}),
        ...(data.observacoes ? { observacoes: data.observacoes.trim() } : {}),
      },
      select: {
        id: true,
        codigoRastreio: true,
        descricao: true,
        status: true,
        recebidaEm: true,
        entregueEm: true,
        observacoes: true,
        criadoEm: true,
        atualizadoEm: true,
        destinatario: {
          select: {
            id: true,
            nome: true,
            email: true,
            perfil: true,
          },
        },
        registradaPor: {
          select: {
            id: true,
            nome: true,
            email: true,
            perfil: true,
          },
        },
      },
    });

    return encomenda;
  }

  async listForUser(userId: string, perfil: string) {
    const where = perfil === 'MORADOR' ? { destinatarioId: userId } : {};

    const encomendas = await prisma.encomenda.findMany({
      where,
      orderBy: { criadoEm: 'desc' },
      select: {
        id: true,
        codigoRastreio: true,
        descricao: true,
        status: true,
        recebidaEm: true,
        entregueEm: true,
        observacoes: true,
        criadoEm: true,
        atualizadoEm: true,
        destinatario: {
          select: {
            id: true,
            nome: true,
            email: true,
            perfil: true,
          },
        },
        registradaPor: {
          select: {
            id: true,
            nome: true,
            email: true,
            perfil: true,
          },
        },
      },
    });

    return encomendas;
  }

  async getById(userId: string, perfil: string, id: string) {
    const encomenda = await prisma.encomenda.findUnique({
      where: { id },
      select: {
        id: true,
        codigoRastreio: true,
        descricao: true,
        status: true,
        recebidaEm: true,
        entregueEm: true,
        observacoes: true,
        criadoEm: true,
        atualizadoEm: true,
        destinatarioId: true,
        destinatario: {
          select: {
            id: true,
            nome: true,
            email: true,
            perfil: true,
          },
        },
        registradaPor: {
          select: {
            id: true,
            nome: true,
            email: true,
            perfil: true,
          },
        },
      },
    });

    if (!encomenda) {
      throw new Error('Encomenda não encontrada.');
    }

    if (perfil === 'MORADOR' && encomenda.destinatarioId !== userId) {
      throw new Error('Acesso negado.');
    }

    return encomenda;
  }

  async updateStatus(userId: string, perfil: string, id: string, data: UpdateStatusInput) {
    if (!['ADMINISTRADOR', 'FUNCIONARIO'].includes(perfil)) {
      throw new Error('Acesso negado.');
    }

    const status = parseStatus(data.status);

    const encomenda = await prisma.encomenda.findUnique({ where: { id } });

    if (!encomenda) {
      throw new Error('Encomenda não encontrada.');
    }

    const updateData: {
      status: StatusEncomenda;
      recebidaEm?: Date;
      entregueEm?: Date;
    } = { status };

    if (status === StatusEncomenda.RECEBIDA && !encomenda.recebidaEm) {
      updateData.recebidaEm = new Date();
    }

    if (status === StatusEncomenda.ENTREGUE && !encomenda.entregueEm) {
      updateData.entregueEm = new Date();
    }

    const updated = await prisma.encomenda.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        codigoRastreio: true,
        descricao: true,
        status: true,
        recebidaEm: true,
        entregueEm: true,
        observacoes: true,
        criadoEm: true,
        atualizadoEm: true,
        destinatario: {
          select: {
            id: true,
            nome: true,
            email: true,
            perfil: true,
          },
        },
        registradaPor: {
          select: {
            id: true,
            nome: true,
            email: true,
            perfil: true,
          },
        },
      },
    });

    return updated;
  }
}

export const encomendasService = new EncomendasService();
