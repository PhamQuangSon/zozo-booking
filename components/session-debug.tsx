"use client"

import { useSession } from "next-auth/react"
import { useEffect } from "react"

export function SessionDebug() {
  const { data: session, status } = useSession()

  useEffect(() => {
    console.log("🔍 SessionDebug Component:", {
      status,
      session,
      timestamp: new Date().toISOString(),
    })
  }, [session, status])

  if (process.env.NODE_ENV !== "development") {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 p-4 bg-black/80 text-white rounded-lg text-xs max-w-xs overflow-auto">
      <h3 className="font-bold mb-2">Session Debug</h3>
      <p>Status: {status}</p>
      {session ? (
        <pre className="mt-2 overflow-auto">{JSON.stringify(session, null, 2)}</pre>
      ) : (
        <p className="mt-2">No session data</p>
      )}
    </div>
  )
}
