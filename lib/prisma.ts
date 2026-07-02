import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as any as { prisma: PrismaClient };

// Ensure DATABASE_URL is set - critical for backend security
if (!process.env.DATABASE_URL) {
  throw new Error("❌ DATABASE_URL is not set in environment variables. Check your .env file.");
}

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    // 🔒 SECURITY: Log only errors in production (never log queries/credentials)
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    errorFormat: "pretty",
  });

// 🔒 SECURITY: Only reuse Prisma client in development to avoid memory leaks in production
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, disconnecting Prisma...");
  await prisma.$disconnect();
  process.exit(0);
});

export default prisma;
