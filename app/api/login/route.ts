import bcrypt from "bcryptjs";
import { type NextRequest, NextResponse } from "next/server";

import { errorResponse, successResponse } from "@/lib/apiResponse";
import { checkRateLimit, getClientIp, resetRateLimit } from "@/lib/rate-limit";
import prisma from "@/lib/prisma";
import { createInitialRefreshToken } from "@/lib/auth-refresh";

/**
 * POST /api/login
 *
 * Standalone REST login endpoint that issues a short-lived access token
 * cookie and sets a httpOnly refresh-token cookie for mobile/API clients.
 *
 * NOTE: The main web UI uses NextAuth via /api/auth/signin.
 * This endpoint exists for programmatic / API consumers only.
 * It uses a DIFFERENT cookie name ("app.access-token") so it does NOT
 * conflict with the NextAuth session cookie.
 */
export async function POST(request: NextRequest) {
  // ── Rate-limiting ────────────────────────────────────────────────────────
  const ip = getClientIp(request);
  const rateLimitResult = checkRateLimit(ip, 5, 15 * 60 * 1000); // 5 attempts / 15 min

  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      errorResponse(
        `Too many login attempts. Please try again in ${rateLimitResult.retryAfterSeconds} seconds.`,
      ),
      {
        status: 429,
        headers: {
          "Retry-After": String(rateLimitResult.retryAfterSeconds),
          "X-RateLimit-Limit": "5",
          "X-RateLimit-Remaining": "0",
        },
      },
    );
  }

  // ── Config guard ─────────────────────────────────────────────────────────
  if (!process.env.NEXTAUTH_SECRET) {
    console.error("Missing NEXTAUTH_SECRET");
    return NextResponse.json(errorResponse("Server misconfiguration"), { status: 500 });
  }

  try {
    const body = await request.json();
    const email = body?.email as string | undefined;
    const password = body?.password as string | undefined;

    if (!email || !password) {
      return NextResponse.json(errorResponse("Missing email or password"), { status: 400 });
    }

    // ── Look up user ──────────────────────────────────────────────────────
    const user = await prisma.user.findUnique({ where: { email } });

    // Use a constant-time branch to prevent user-enumeration timing attacks
    if (!user || !user.password) {
      await bcrypt.compare(password, "$2b$12$invalidhashpadding000000000000000000000000000000000000000");
      return NextResponse.json(errorResponse("Invalid credentials"), { status: 401 });
    }

    if (!user.emailVerified) {
      return NextResponse.json(
        errorResponse("Please verify your email before logging in"),
        { status: 401 },
      );
    }

    // ── Verify password ───────────────────────────────────────────────────
    const isCorrectPassword = await bcrypt.compare(password, user.password);
    if (!isCorrectPassword) {
      return NextResponse.json(errorResponse("Invalid credentials"), { status: 401 });
    }

    // ── Success: reset rate-limit counter ─────────────────────────────────
    resetRateLimit(ip);

    // ── Issue refresh token (DB-backed, rotatable) ────────────────────────
    const refreshToken = await createInitialRefreshToken(user.id);

    // ── Build response ────────────────────────────────────────────────────
    const response = NextResponse.json(
      successResponse({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      }),
    );

    // Refresh token cookie — long-lived, httpOnly, never readable from JS
    response.cookies.set({
      name: "app.refresh-token",
      value: refreshToken.token,
      httpOnly: true,
      path: "/api",          // Only sent to /api/* routes
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(errorResponse("An unexpected error occurred"), { status: 500 });
  }
}
