import type { ReservationStatus, TableStatus } from "@prisma/client";
import { z } from "zod";

export const DEFAULT_RESERVATION_MINUTES = 90;
export const MAX_GUESTS_PER_RESERVATION = 20;
export const MAX_DAYS_IN_ADVANCE = 60;
// Allow a small grace period so "book now" requests are not rejected by clock drift.
const PAST_GRACE_MS = 5 * 60 * 1000;

// Reservations in these statuses still hold their table.
export const ACTIVE_RESERVATION_STATUSES: ReservationStatus[] = ["PENDING", "CONFIRMED", "SEATED"];

export const createReservationSchema = z.object({
  restaurantId: z.coerce.number().int().positive(),
  reservedAt: z.coerce.date(),
  guests: z.coerce.number().int().min(1).max(MAX_GUESTS_PER_RESERVATION),
  customerName: z.string().trim().min(1).max(100),
  customerEmail: z.string().trim().email().max(200).optional().or(z.literal("")),
  customerPhone: z
    .string()
    .trim()
    .regex(/^\+?[0-9\s.-]{8,20}$/, "Invalid phone number"),
  notes: z.string().trim().max(500).optional(),
});

export type CreateReservationInput = z.infer<typeof createReservationSchema>;

export type TimeSlot = { start: Date; end: Date };

export type TableCandidate = {
  id: number;
  number: number;
  capacity: number;
  status: TableStatus;
};

export type ExistingReservation = {
  tableId: number | null;
  reservedAt: Date;
  durationMinutes: number;
};

export function getReservationSlot(
  reservedAt: Date,
  durationMinutes = DEFAULT_RESERVATION_MINUTES,
): TimeSlot {
  return {
    start: reservedAt,
    end: new Date(reservedAt.getTime() + durationMinutes * 60 * 1000),
  };
}

// Half-open intervals: a slot ending at 19:00 does not overlap one starting at 19:00.
export function slotsOverlap(a: TimeSlot, b: TimeSlot): boolean {
  return a.start < b.end && b.start < a.end;
}

export function validateReservationTime(
  reservedAt: Date,
  now: Date = new Date(),
): { ok: true } | { ok: false; error: string } {
  if (Number.isNaN(reservedAt.getTime())) {
    return { ok: false, error: "Invalid reservation time" };
  }
  if (reservedAt.getTime() < now.getTime() - PAST_GRACE_MS) {
    return { ok: false, error: "Reservation time must be in the future" };
  }
  const maxTime = now.getTime() + MAX_DAYS_IN_ADVANCE * 24 * 60 * 60 * 1000;
  if (reservedAt.getTime() > maxTime) {
    return {
      ok: false,
      error: `Reservations can only be made up to ${MAX_DAYS_IN_ADVANCE} days in advance`,
    };
  }
  return { ok: true };
}

/**
 * Picks the smallest free table that fits the party for the requested slot.
 * A table's current status only matters when the slot starts before the table
 * could reasonably be freed (i.e. the slot overlaps "now").
 */
export function pickAvailableTable(params: {
  tables: TableCandidate[];
  reservations: ExistingReservation[];
  guests: number;
  slot: TimeSlot;
  now?: Date;
}): TableCandidate | null {
  const { tables, reservations, guests, slot } = params;
  const now = params.now ?? new Date();
  const currentWindow = getReservationSlot(now);
  const slotIsImminent = slotsOverlap(slot, currentWindow);

  const busyTableIds = new Set(
    reservations
      .filter((r) => r.tableId !== null)
      .filter((r) => slotsOverlap(slot, getReservationSlot(r.reservedAt, r.durationMinutes)))
      .map((r) => r.tableId as number),
  );

  const candidates = tables
    .filter((t) => t.capacity >= guests)
    .filter((t) => t.status !== "MAINTENANCE")
    .filter((t) => !slotIsImminent || t.status === "AVAILABLE")
    .filter((t) => !busyTableIds.has(t.id))
    .sort((a, b) => a.capacity - b.capacity || a.number - b.number);

  return candidates[0] ?? null;
}
