import { StatusReserva } from '@prisma/client';
import { prisma } from '../lib/prisma.js';

type CreateReservaInput = {
  areaComumId: string;
  dataInicio: string;
  dataFim: string;
  observacoes?: string;
};

type AvailableSlotsInput = {
  areaComumId: string;
  data: string;
  duracaoMinutos?: number;
};

const SLOT_STEP_MINUTES = 30;

function parseDateTime(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error('Data inválida.');
  }
  return parsed;
}

function parseDay(value: string) {
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error('Data inválida.');
  }
  return parsed;
}

function formatIsoLocal(date: Date) {
  return date.toISOString();
}

function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

export class ReservasService {
  async create(userId: string, data: CreateReservaInput) {
    const dataInicio = parseDateTime(data.dataInicio);
    const dataFim = parseDateTime(data.dataFim);
    const agora = new Date();

    if (dataInicio >= dataFim) {
      throw new Error('A data de início deve ser anterior à data de fim.');
    }

    if (dataInicio <= agora) {
      throw new Error('Não é permitido reservar horários no passado.');
    }

    const [usuario, area] = await Promise.all([
      prisma.usuario.findUnique({ where: { id: userId } }),
      prisma.areaComum.findUnique({ where: { id: data.areaComumId } }),
    ]);

    if (!usuario || !usuario.ativo) {
      throw new Error('Usuário não encontrado ou inativo.');
    }

    if (!area || !area.ativo) {
      throw new Error('Área comum não encontrada ou inativa.');
    }

    const duplicate = await prisma.reserva.findFirst({
      where: {
        usuarioId: userId,
        areaComumId: data.areaComumId,
        dataInicio,
        dataFim,
        status: { in: [StatusReserva.PENDENTE, StatusReserva.APROVADA] },
      },
    });

    if (duplicate) {
      throw new Error('Você já possui uma reserva idêntica para este horário.');
    }

    const conflicting = await prisma.reserva.findFirst({
      where: {
        areaComumId: data.areaComumId,
        status: { in: [StatusReserva.PENDENTE, StatusReserva.APROVADA] },
        dataInicio: { lt: dataFim },
        dataFim: { gt: dataInicio },
      },
    });

    if (conflicting) {
      throw new Error('Já existe uma reserva que conflita com esse horário.');
    }

    const reserva = await prisma.reserva.create({
      data: {
        usuarioId: userId,
        areaComumId: data.areaComumId,
        dataInicio,
        dataFim,
        ...(data.observacoes !== undefined ? { observacoes: data.observacoes } : {}),
        status: StatusReserva.APROVADA,
      },
      select: {
        id: true,
        usuarioId: true,
        areaComumId: true,
        dataInicio: true,
        dataFim: true,
        status: true,
        observacoes: true,
        criadoEm: true,
        atualizadoEm: true,
      },
    });

    return reserva;
  }

  async cancel(userId: string, reservaId: string) {
    const reserva = await prisma.reserva.findUnique({ where: { id: reservaId } });

    if (!reserva) {
      throw new Error('Reserva não encontrada.');
    }

    if (reserva.usuarioId !== userId) {
      throw new Error('Você só pode cancelar a sua própria reserva.');
    }

    if (reserva.status === StatusReserva.CANCELADA) {
      throw new Error('A reserva já está cancelada.');
    }

    if (reserva.dataInicio <= new Date()) {
      throw new Error('Só é permitido cancelar reservas futuras.');
    }

    const updated = await prisma.reserva.update({
      where: { id: reservaId },
      data: { status: StatusReserva.CANCELADA },
      select: {
        id: true,
        usuarioId: true,
        areaComumId: true,
        dataInicio: true,
        dataFim: true,
        status: true,
        observacoes: true,
        criadoEm: true,
        atualizadoEm: true,
      },
    });

    return updated;
  }

  async availableSlots(input: AvailableSlotsInput) {
    const durationMinutes = input.duracaoMinutos ?? 60;

    if (!input.areaComumId) {
      throw new Error('Área comum é obrigatória.');
    }

    if (!input.data) {
      throw new Error('Data é obrigatória.');
    }

    if (!Number.isFinite(durationMinutes) || durationMinutes <= 0) {
      throw new Error('A duração deve ser maior que zero.');
    }

    const area = await prisma.areaComum.findUnique({ where: { id: input.areaComumId } });
    if (!area || !area.ativo) {
      throw new Error('Área comum não encontrada ou inativa.');
    }

    const dayStart = parseDay(input.data);
    const dayEnd = addMinutes(dayStart, 24 * 60);

    const reservations = await prisma.reserva.findMany({
      where: {
        areaComumId: input.areaComumId,
        status: { in: [StatusReserva.PENDENTE, StatusReserva.APROVADA] },
        dataInicio: { lt: dayEnd },
        dataFim: { gt: dayStart },
      },
      orderBy: { dataInicio: 'asc' },
      select: {
        id: true,
        dataInicio: true,
        dataFim: true,
        status: true,
      },
    });

    const intervals: Array<{ inicio: Date; fim: Date }> = [];
    let cursor = dayStart;

    for (const reservation of reservations) {
      if (cursor < reservation.dataInicio) {
        intervals.push({ inicio: cursor, fim: reservation.dataInicio });
      }

      if (reservation.dataFim > cursor) {
        cursor = reservation.dataFim;
      }
    }

    if (cursor < dayEnd) {
      intervals.push({ inicio: cursor, fim: dayEnd });
    }

    const availableSlots = intervals
      .filter((interval) => interval.fim.getTime() - interval.inicio.getTime() >= durationMinutes * 60 * 1000)
      .map((interval) => {
        const slots: Array<{ inicio: string; fim: string }> = [];
        let slotStart = new Date(interval.inicio);

        while (addMinutes(slotStart, durationMinutes) <= interval.fim) {
          const slotEnd = addMinutes(slotStart, durationMinutes);
          slots.push({ inicio: formatIsoLocal(slotStart), fim: formatIsoLocal(slotEnd) });
          slotStart = addMinutes(slotStart, SLOT_STEP_MINUTES);
        }

        return slots;
      })
      .flat();

    return {
      areaComumId: input.areaComumId,
      data: input.data,
      duracaoMinutos: durationMinutes,
      horariosDisponiveis: availableSlots,
    };
  }

  async futureReservations(userId: string) {
    const agora = new Date();

    const reservas = await prisma.reserva.findMany({
      where: {
        usuarioId: userId,
        status: { in: [StatusReserva.PENDENTE, StatusReserva.APROVADA] },
        dataFim: { gt: agora },
      },
      orderBy: { dataInicio: 'asc' },
      select: {
        id: true,
        areaComumId: true,
        dataInicio: true,
        dataFim: true,
        status: true,
        observacoes: true,
        areaComum: {
          select: {
            id: true,
            nome: true,
            localizacao: true,
          },
        },
      },
    });

    return reservas;
  }
}

export const reservasService = new ReservasService();
