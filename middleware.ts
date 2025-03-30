import { NextResponse } from "next/server"
import { verify } from "jsonwebtoken"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  // Get the token from the cookies
  const token = request.cookies.get("auth-token")?.value
  const isAuthenticated = !!token

  try {
    // Verify the token if it exists
    if (token) {
      verify(token, process.env.NEXTAUTH_SECRET || "fallback-secret")
    }
  } catch (error) {
    // If token verification fails, consider the user not authenticated
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Define paths that require authentication
  const authPaths = ["/admin", "/dashboard"]
  const isAuthPath = authPaths.some((path) => request.nextUrl.pathname.startsWith(path))

  // Define paths that are public
  const publicPaths = ["/login", "/register", "/verify", "/forgot-password", "/reset-password"]
  const isPublicPath = publicPaths.some((path) => request.nextUrl.pathname.startsWith(path))

  // Redirect unauthenticated users to login
  if (isAuthPath && !isAuthenticated) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Redirect authenticated users away from login/register pages
  if (isPublicPath && isAuthenticated) {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url))
  }

  return NextResponse.next()
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
}

