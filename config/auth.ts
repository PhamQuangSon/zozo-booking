import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { createHash } from "crypto"
import prisma from "@/lib/prisma"
import { UserRole } from "@prisma/client"

// Types
type AuthError = {
  _form?: string;
  email?: string[];
  password?: string[];
}

type AuthState = {
  success: boolean;
  error?: AuthError;
  message?: string;
  redirectUrl?: string;
}

// Hash password using SHA-256
const hashPassword = (password: string) => {
  return createHash('sha256').update(password).digest('hex')
}

// This is the NextAuth v5 configuration
export const { handlers: authHandlers, signIn, signOut, auth, unstable_update } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const typedCredentials = credentials as Record<"email" | "password", string>
          if (!typedCredentials?.email || !typedCredentials?.password) {
            console.log('Missing credentials')
            return null
          }

          const foundUser = await prisma.user.findUnique({
            where: {
              email: typedCredentials.email,
            },
          })

          if (!foundUser || !foundUser.password) {
            console.log('User not found or no password')
            return null
          }

          if (!foundUser.emailVerified) {
            console.log('Email not verified')
            throw new Error("Please verify your email before logging in")
          }

          // Hash the provided password
          const providedHash = hashPassword(typedCredentials.password)
          console.log('Auth check:', {
            provided: providedHash,
            stored: foundUser.password,
            match: providedHash === foundUser.password
          })

          const isCorrectPassword = providedHash === foundUser.password
          if (!isCorrectPassword) {
            console.log('Password mismatch')
            return null
          }

          const userData = {
            id: foundUser.id,
            email: foundUser.email,
            name: foundUser.name,
            role: foundUser.role,
          }
          console.log('Auth successful:', userData)
          return userData
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Add user data to the token when signing in
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      // Add token data to the session
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.name = token.name as string
        session.user.role = token.role as string
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
})

