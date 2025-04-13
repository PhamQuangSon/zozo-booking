"use client"
import type React from "react"

export default function RestaurantsPage({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen">
      <div className="flex-1 space-y-4 p-8 pt-6 overflow-auto">{children}</div>
    </div>
  )
}

