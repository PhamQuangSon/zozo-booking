import { prisma } from "./prisma";

// 🔒 SECURITY: Custom error type that doesn't expose sensitive info
class DatabaseError extends Error {
  constructor(
    public originalError: Error,
    message: string,
  ) {
    super(message);
    this.name = "DatabaseError";
  }
}

// Helper để retry database operations khi connection bị đóng
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delay = 1000,
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      // Check if it's a connection error
      const isConnectionError =
        error instanceof Error &&
        (error.message.includes("Closed") ||
          error.message.includes("Connection") ||
          error.message.includes("ECONNRESET"));

      if (!isConnectionError || attempt === maxRetries) {
        // 🔒 SECURITY: Log internally but throw sanitized error
        if (process.env.NODE_ENV === "development") {
          console.error("Database operation error:", error);
        } else {
          console.error("Database operation failed (details hidden in production)");
        }
        throw error;
      }

      console.warn(`Database connection attempt ${attempt}/${maxRetries} failed, retrying...`);

      // Disconnect and reconnect
      try {
        await prisma.$disconnect();
      } catch (disconnectError) {
        // Ignore disconnect errors
      }

      // Wait before retry (exponential backoff)
      await new Promise((resolve) => setTimeout(resolve, delay * attempt));
    }
  }

  throw lastError;
}

// Helper để check database health
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    await withRetry(async () => {
      await prisma.$queryRaw`SELECT 1`;
    });
    return true;
  } catch (error) {
    // 🔒 SECURITY: Don't log error details in production
    if (process.env.NODE_ENV === "development") {
      console.error("Database health check failed:", error);
    } else {
      console.error("Database health check failed");
    }
    return false;
  }
}

// Graceful shutdown
export async function disconnectDatabase(): Promise<void> {
  try {
    await prisma.$disconnect();
    console.log("Database disconnected gracefully");
  } catch (error) {
    console.error("Error disconnecting database:", error);
  }
}

// Handle process termination
if (typeof process !== "undefined") {
  process.on("SIGINT", disconnectDatabase);
  process.on("SIGTERM", disconnectDatabase);
  process.on("beforeExit", disconnectDatabase);
}
