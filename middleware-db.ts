import { type NextRequest, NextResponse } from "next/server";
import { checkDatabaseHealth } from "./lib/db-connection";

export async function middleware(request: NextRequest) {
  // Check database health for API routes
  if (request.nextUrl.pathname.startsWith("/api/")) {
    try {
      const isHealthy = await checkDatabaseHealth();
      if (!isHealthy) {
        console.warn("Database health check failed for:", request.nextUrl.pathname);
        // Continue anyway, let individual queries handle retries
      }
    } catch (error) {
      console.error("Middleware database check error:", error);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api/:path*",
    // Skip static files and images
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
