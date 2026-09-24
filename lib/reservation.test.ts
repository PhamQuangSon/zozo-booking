import { describe, expect, it } from "vitest";

import {
  createReservationSchema,
  getReservationSlot,
  pickAvailableTable,
  slotsOverlap,
  type TableCandidate,
  validateReservationTime,
} from "./reservation";

const now = new Date("2026-09-24T10:00:00Z");
const at = (iso: string) => new Date(iso);

const tables: TableCandidate[] = [
  { id: 1, number: 1, capacity: 2, status: "AVAILABLE" },
  { id: 2, number: 2, capacity: 4, status: "AVAILABLE" },
  { id: 3, number: 3, capacity: 6, status: "OCCUPIED" },
  { id: 4, number: 4, capacity: 4, status: "MAINTENANCE" },
];

describe("slotsOverlap", () => {
  it("treats back-to-back slots as non-overlapping", () => {
    const a = getReservationSlot(at("2026-09-24T18:00:00Z"), 60);
    const b = getReservationSlot(at("2026-09-24T19:00:00Z"), 60);
    expect(slotsOverlap(a, b)).toBe(false);
  });

  it("detects partial overlap", () => {
    const a = getReservationSlot(at("2026-09-24T18:00:00Z"), 90);
    const b = getReservationSlot(at("2026-09-24T19:00:00Z"), 90);
    expect(slotsOverlap(a, b)).toBe(true);
  });
});

describe("validateReservationTime", () => {
  it("rejects times in the past", () => {
    expect(validateReservationTime(at("2026-09-24T09:00:00Z"), now).ok).toBe(false);
  });

  it("accepts times within the grace period", () => {
    expect(validateReservationTime(at("2026-09-24T09:58:00Z"), now).ok).toBe(true);
  });

  it("rejects times too far in advance", () => {
    expect(validateReservationTime(at("2027-01-01T10:00:00Z"), now).ok).toBe(false);
  });
});

describe("pickAvailableTable", () => {
  const futureSlot = getReservationSlot(at("2026-09-25T18:00:00Z"));

  it("picks the smallest table that fits", () => {
    const table = pickAvailableTable({
      tables,
      reservations: [],
      guests: 2,
      slot: futureSlot,
      now,
    });
    expect(table?.id).toBe(1);
  });

  it("skips tables with an overlapping reservation", () => {
    const table = pickAvailableTable({
      tables,
      reservations: [{ tableId: 2, reservedAt: at("2026-09-25T17:30:00Z"), durationMinutes: 90 }],
      guests: 3,
      slot: futureSlot,
      now,
    });
    expect(table?.id).toBe(3);
  });

  it("ignores current OCCUPIED status for future slots but never uses MAINTENANCE", () => {
    const table = pickAvailableTable({
      tables,
      reservations: [],
      guests: 5,
      slot: futureSlot,
      now,
    });
    expect(table?.id).toBe(3);
  });

  it("requires AVAILABLE status when the slot starts now", () => {
    const table = pickAvailableTable({
      tables,
      reservations: [],
      guests: 5,
      slot: getReservationSlot(now),
      now,
    });
    expect(table).toBeNull();
  });

  it("returns null when no table is large enough", () => {
    expect(
      pickAvailableTable({ tables, reservations: [], guests: 10, slot: futureSlot, now }),
    ).toBeNull();
  });
});

describe("createReservationSchema", () => {
  const valid = {
    restaurantId: "1",
    reservedAt: "2026-09-25T18:00:00.000Z",
    guests: "2",
    customerName: "An",
    customerEmail: "",
    customerPhone: "0901 234 567",
  };

  it("coerces form values", () => {
    const parsed = createReservationSchema.parse(valid);
    expect(parsed.restaurantId).toBe(1);
    expect(parsed.guests).toBe(2);
    expect(parsed.reservedAt).toBeInstanceOf(Date);
  });

  it("rejects invalid phone numbers", () => {
    expect(createReservationSchema.safeParse({ ...valid, customerPhone: "abc" }).success).toBe(
      false,
    );
  });
});
