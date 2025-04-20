import { Prisma } from "@prisma/client";

/**
 * Converts Prisma Decimal values to numbers for JSON serialization
 * This is needed because Prisma's Decimal type doesn't automatically serialize to JSON
 */
export function serializePrismaData<T>(data: T): T {
  if (data === null || data === undefined) {
    return data;
  }

  if (data instanceof Prisma.Decimal) {
    return data.toNumber() as unknown as T;
  }

  if (Array.isArray(data)) {
    return data.map(serializePrismaData) as unknown as T;
  }

  if (typeof data === "object" && data !== null) {
    return Object.fromEntries(
      Object.entries(data).map(([key, value]) => {
        if (value instanceof Date) {
          return [key, value.toISOString()]; // Serialize Date fields
        }
        return [key, serializePrismaData(value)];
      })
    ) as unknown as T;
  }

  return data;
}

/**
 * Helper function to safely convert a Decimal to a number
 * Returns 0 if the value is null or undefined
 */
export function decimalToNumber(
  value: Prisma.Decimal | null | undefined
): number {
  if (value === null || value === undefined) {
    return 0;
  }
  return value.toNumber();
}
