import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { createInitialRefreshToken, rotateRefreshToken } from "@/lib/auth-refresh";
import prisma from "@/lib/prisma";

// Enable more verbose logging in development only
const DEBUG = process.env.NODE_ENV === "development";

function debugLog(message: string, data?: unknown) {
  if (DEBUG) {
    console.log(`🔍 NextAuth Debug: ${message}`, data ?? "");
  }
}

export const {
  handlers: authHandlers,
  signIn,
  signOut,
  auth,
  unstable_update,
} = NextAuth({
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        debugLog("authorize() called", credentials ? "credentials provided" : "missing");
        try {
          const typed = credentials as Record<"email" | "password", string>;
          if (!typed?.email || !typed?.password) {
            debugLog("Missing credentials");
            return null;
          }

          const foundUser = await prisma.user.findUnique({
            where: { email: typed.email },
          });

          if (!foundUser || !foundUser.password) {
            debugLog("User not found or no password");
            return null;
          }

          const isCorrectPassword = await bcrypt.compare(typed.password, foundUser.password);
          if (!isCorrectPassword) {
            debugLog("Password mismatch");
            return null;
          }

          // Tạo Refresh Token ban đầu trong DB
          const refreshToken = await createInitialRefreshToken(foundUser.id);

          debugLog("Auth successful", { id: foundUser.id, email: foundUser.email });

          // Không trả về password; đính kèm refreshToken để jwt callback nhận
          return {
            id: foundUser.id,
            email: foundUser.email,
            name: foundUser.name,
            image: foundUser.image,
            bio: foundUser.bio,
            role: foundUser.role,
            refreshToken: refreshToken.token,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, trigger }) {
      debugLog(`JWT callback — trigger: ${trigger}`, {
        hasToken: !!token,
        hasUser: !!user,
      });

      // Initial sign-in: copy all user fields into the JWT
      if (user) {
        return {
          ...token,
          id: user.id,
          role: (user as any).role,
          image: (user as any).image,
          bio: (user as any).bio,
          refreshToken: (user as any).refreshToken,
          accessTokenExpires: Date.now() + 15 * 60 * 1000, // 15 phút
        };
      }

      // Access token still valid → return as-is
      if (Date.now() < (token.accessTokenExpires as number)) {
        return token;
      }

      // Access token expired → rotate refresh token
      debugLog("Access token expired, attempting refresh…");
      try {
        const { token: newRefreshToken } = await rotateRefreshToken(
          token.refreshToken as string,
        );
        return {
          ...token,
          refreshToken: newRefreshToken,
          accessTokenExpires: Date.now() + 15 * 60 * 1000,
          error: undefined, // clear any previous error
        };
      } catch (error) {
        debugLog("Refresh token failed", error);
        return { ...token, error: "RefreshAccessTokenError" };
      }
    },

    async session({ session, token, trigger }) {
      debugLog(`Session callback — trigger: ${trigger}`);

      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.image as string;
        session.user.bio = (token.bio as string) ?? null;
        session.user.role = token.role as string;
      }

      // Surface refresh errors to the client so it can force a re-login
      (session as any).error = token.error;

      debugLog("Session built", session);
      return session;
    },
  },

  pages: {
    signIn: "/login",
    signOut: "/logout",
    error: "/login",
    verifyRequest: "/verify",
  },

  session: {
    strategy: "jwt",
    // Maximum lifetime of a session even with continuous refresh
    maxAge: 30 * 24 * 60 * 60, // 30 days
    // Only re-issue the session cookie if it's older than 60 seconds,
    // preventing a DB/token hit on every single request.
    updateAge: 60,
  },

  cookies: {
    sessionToken: {
      name: "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },

  debug: DEBUG,
});
