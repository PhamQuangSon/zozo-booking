import { Prisma } from "@prisma/client";

import prisma from "@/lib/prisma";
import {
  ACTIVE_RESERVATION_STATUSES,
  DEFAULT_RESERVATION_MINUTES,
  getReservationSlot,
  pickAvailableTable,
  validateReservationTime,
} from "@/lib/reservation";

export type ReserveTableParams = {
  restaurantId: number;
  reservedAt: Date;
  guests: number;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  notes?: string | null;
  userId?: string | null;
  source?: string;
  durationMinutes?: number;
};

export type ReserveTableResult =
  | {
      success: true;
      reservation: {
        id: number;
        reservedAt: Date;
        guests: number;
        tableId: number;
        tableNumber: number;
      };
    }
  | { success: false; error: string };

const MAX_SERIALIZATION_RETRIES = 2;

/**
 * Assigns a free table and creates the reservation atomically. Runs as a
 * serializable transaction so two concurrent requests cannot grab the same slot.
 */
export async function reserveTable(params: ReserveTableParams): Promise<ReserveTableResult> {
  const durationMinutes = params.durationMinutes ?? DEFAULT_RESERVATION_MINUTES;
  const timeCheck = validateReservationTime(params.reservedAt);
  if (!timeCheck.ok) {
    return { success: false, error: timeCheck.error };
  }

  const slot = getReservationSlot(params.reservedAt, durationMinutes);
  // Widest possible look-back so any reservation that could still be running at slot.start is included.
  const lookBack = new Date(slot.start.getTime() - 24 * 60 * 60 * 1000);

  for (let attempt = 0; ; attempt++) {
    try {
      return await prisma.$transaction(
        async (tx) => {
          const restaurant = await tx.restaurant.findUnique({
            where: { id: params.restaurantId },
            select: { id: true },
          });
          if (!restaurant) {
            return { success: false as const, error: "Restaurant not found" };
          }

          const [tables, reservations] = await Promise.all([
            tx.table.findMany({
              where: { restaurantId: params.restaurantId },
              select: { id: true, number: true, capacity: true, status: true },
            }),
            tx.reservation.findMany({
              where: {
                restaurantId: params.restaurantId,
                status: { in: ACTIVE_RESERVATION_STATUSES },
                reservedAt: { gte: lookBack, lt: slot.end },
              },
              select: { tableId: true, reservedAt: true, durationMinutes: true },
            }),
          ]);

          const table = pickAvailableTable({
            tables,
            reservations,
            guests: params.guests,
            slot,
          });
          if (!table) {
            return {
              success: false as const,
              error: "No table available for that time and party size",
            };
          }

          const reservation = await tx.reservation.create({
            data: {
              restaurantId: params.restaurantId,
              tableId: table.id,
              userId: params.userId ?? null,
              customerName: params.customerName,
              customerPhone: params.customerPhone,
              customerEmail: params.customerEmail || null,
              guests: params.guests,
              reservedAt: params.reservedAt,
              durationMinutes,
              notes: params.notes || null,
              source: params.source ?? "web",
            },
          });

          return {
            success: true as const,
            reservation: {
              id: reservation.id,
              reservedAt: reservation.reservedAt,
              guests: reservation.guests,
              tableId: table.id,
              tableNumber: table.number,
            },
          };
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
    } catch (error) {
      const isSerializationConflict =
        error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034";
      if (isSerializationConflict && attempt < MAX_SERIALIZATION_RETRIES) {
        continue;
      }
      throw error;
    }
  }
}
