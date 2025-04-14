"use client"

import type React from "react"

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react"
import { useState, useEffect } from "react"
import type { Session } from "next-auth"

export function NextAuthProvider({
  children,
  session,
}: {
  children: React.ReactNode
  session?: Session | null
}) {
  const [error, setError] = useState<Error | null>(null)

  // Error handling for session loading
  useEffect(() => {
    if (error) {
      console.error("Session provider error:", error)
    }
  }, [error])

  return (
    <NextAuthSessionProvider session={session}>
      {children}
    </NextAuthSessionProvider>
  )
}
