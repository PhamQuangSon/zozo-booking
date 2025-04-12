import type React from "react"
import { AdminSidebar } from "@/components/admin-sidebar"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen">
      <AdminSidebar />
      <div className="flex-1 space-y-4 p-8 pt-6 overflow-auto">{children}</div>
    </div>
  )
}

