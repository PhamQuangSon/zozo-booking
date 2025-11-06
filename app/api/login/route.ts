import { type NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { sign } from "jsonwebtoken";

import { errorResponse, successResponse } from "@/lib/apiResponse";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = body?.email as string | undefined;
    const password = body?.password as string | undefined;

    if (!email || !password) {
      return NextResponse.json(errorResponse("Missing email or password"), {
        status: 400,
      });
    }

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.password) {
      return NextResponse.json(errorResponse("Invalid credentials"), {
        status: 401,
      });
    }

    if (!user.emailVerified) {
      return NextResponse.json(
        errorResponse("Please verify your email before logging in"),
        { status: 401 }
      );
    }

    // Verify password
    const isCorrectPassword = await bcrypt.compare(password, user.password);
    if (!isCorrectPassword) {
      return NextResponse.json(errorResponse("Invalid credentials"), {
        status: 401,
      });
    }

    // Create a JWT token
    const token = sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      process.env.NEXTAUTH_SECRET || "your-secret-key",
      { expiresIn: "7d" }
    );

    // Create the response
    const response = NextResponse.json(successResponse({ success: true }));

    // Set the session cookie on the response
    response.cookies.set({
      name: "next-auth.session-token", // Or your preferred cookie name
      value: token,
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60, // 1 week
    });

    return response; // Return the response with the cookie set
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(errorResponse("An unexpected error occurred"), {
      status: 500,
    });
  }
}
