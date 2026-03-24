import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import prisma from "@/lib/prisma";

// Enable more verbose logging
const DEBUG = process.env.NODE_ENV === "development";

// Helper function for consistent logging
function debugLog(message: string, data?: any) {
  if (DEBUG) {
    console.log(`🔍 NextAuth Debug: ${message}`, data || "");
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
        debugLog("🟢 authorize() called with credentials", credentials ? "provided" : "missing");
        try {
          const typedCredentials = credentials as Record<"email" | "password", string>;
          if (!typedCredentials?.email || !typedCredentials?.password) {
            debugLog("🟢 Missing credentials");
            return null;
          }

          const foundUser = await prisma.user.findUnique({
            where: {
              email: typedCredentials.email,
            },
          });

          if (!foundUser || !foundUser.password) {
            debugLog("🟢 User not found or no password");
            return null;
          }

          // Hash the provided password
          const isCorrectPassword = await bcrypt.compare(
            typedCredentials.password,
            foundUser.password,
          );
          if (!isCorrectPassword) {
            debugLog("🟢 Password mismatch");
            return null;
          }

          const userData = {
            id: foundUser.id,
            email: foundUser.email,
            image: foundUser.image,
            bio: foundUser.bio,
            name: foundUser.name,
            role: foundUser.role,
          };
          debugLog("🟢 Auth foundUser", foundUser);
          debugLog("🟢 Auth successful", userData);
          return userData;
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account, trigger }) {
      debugLog(`JWT callback triggered by ${trigger}`, {
        tokenExists: !!token,
        userExists: !!user,
        accountExists: !!account,
      });

      // Add user data to the token when signing in
      if (user) {
        debugLog("🟢 Adding user data to token", user);
        token.id = user.id;
        token.email = user.email;
        token.image = user.image;
        token.bio = user.bio;
        token.name = user.name;
        token.role = user.role;
      }

      debugLog("🟢 JWT token created/updated", token);
      return token;
    },
    async session({ session, token, trigger }) {
      debugLog(`Session callback triggered by ${trigger}`, {
        sessionExists: !!session,
        tokenExists: !!token,
      });

      // Add token data to the session
      if (token && session.user) {
        debugLog("🟢 Adding token data to session", token);
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.image = token.image as string;
        session.user.bio = token.bio as string;
        session.user.name = token.name as string;
        session.user.role = token.role as string;
      }

      debugLog("🟢 Session created/updated", session);
      return session;
    },
  },
  pages: {
    signIn: "/login",
    signOut: "/logout",
    error: "/login", // Error code passed in query string as ?error=
    verifyRequest: "/verify", // (used for check email message)
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
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
