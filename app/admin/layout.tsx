import { redirect } from "next/navigation";
import type React from "react";

import { AdminSidebar } from "@/components/admin-sidebar";
import { auth } from "@/config/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check authentication server-side
  const session = await auth();

  // Redirect if not authenticated or not an admin/staff
  if (
    !session?.user ||
    (session.user.role !== "ADMIN" && session.user.role !== "STAFF")
  ) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen">
      <AdminSidebar />
      <div className="flex-1 space-y-4 p-8 pt-6 overflow-auto">{children}</div>
    </div>
  );
}
