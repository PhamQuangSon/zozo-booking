"use server";

import { headers } from "next/headers";

import { auth } from "@/config/auth";
import { createRateLimiter, getClientIp } from "@/lib/rate-limit";
import { type CreateReservationInput, createReservationSchema } from "@/lib/reservation";
import { reserveTable } from "@/lib/reservation-service";

export type CreateReservationResult =
  | {
      success: true;
      data: { id: number; reservedAt: string; guests: number; tableNumber: number };
    }
  | { success: false; error: string; fieldErrors?: Record<string, string[] | undefined> };

const checkRateLimit = createRateLimiter({ windowMs: 60 * 1000, max: 5 });

export async function createReservation(
  input: CreateReservationInput,
): Promise<CreateReservationResult> {
  const parsed = createReservationSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Invalid reservation details",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const ip = getClientIp(await headers());
  const limit = checkRateLimit(`reservation:${ip}`);
  if (!limit.allowed) {
    return { success: false, error: "Too many reservation attempts. Please try again shortly." };
  }

  try {
    const session = await auth();
    const result = await reserveTable({
      ...parsed.data,
      userId: session?.user?.id ?? null,
      source: "web",
    });

    if (!result.success) {
      return { success: false, error: result.error };
    }

    const { reservation } = result;
    return {
      success: true,
      data: {
        id: reservation.id,
        reservedAt: reservation.reservedAt.toISOString(),
        guests: reservation.guests,
        tableNumber: reservation.tableNumber,
      },
    };
  } catch (error) {
    console.error("Failed to create reservation:", error);
    return { success: false, error: "Failed to create reservation" };
  }
}
