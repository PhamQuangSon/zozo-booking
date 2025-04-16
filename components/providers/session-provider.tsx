"use client"

import type React from "react"

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react"
import type { Session } from "next-auth"

export function NextAuthProvider({
  children,
  session,
}: {
  children: React.ReactNode
  session?: Session | null
}) {

  return (
    <NextAuthSessionProvider session={session}>
      {children}
    </NextAuthSessionProvider>
  )
}
