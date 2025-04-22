import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { auth } from "@/config/auth";

// This is the NextAuth v5 middleware
export async function middleware(request: NextRequest) {
  const session = await auth();
  console.log("Session in middleware:", session);
  // Get the pathname
  const path = request.nextUrl.pathname;

  // Define paths that require authentication
  const authPaths = ["/admin", "/dashboard"];
  const isAuthPath = authPaths.some((authPath) => path.startsWith(authPath));

  // Define paths that are public
  const publicPaths = [
    "/login",
    "/register",
    "/verify",
    "/forgot-password",
    "/reset-password",
  ];
  const isPublicPath = publicPaths.some((publicPath) =>
    path.startsWith(publicPath)
  );

  // Redirect unauthenticated users to login
  if (isAuthPath && !session) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(redirectUrl);
  }

  // Redirect authenticated users away from login/register pages
  if (
    isPublicPath &&
    session &&
    session.user.role !== "ADMIN" &&
    session.user.role !== "STAFF"
  ) {
    console.log("Authenticated user trying to access public path:", path);
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  return NextResponse.next();
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    "/admin/:path*",
    "/dashboard/:path*",
    "/login",
    "/register",
    "/verify/:path*",
    "/forgot-password",
    "/reset-password/:path*",
  ],
};
