import { redirect } from "next/navigation";
import type React from "react";

import { AdminSidebar } from "@/components/admin-sidebar";
import { MobileAdminHeader } from "@/components/admin/mobile-admin-header";
import { auth } from "@/config/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check authentication server-side
  const session = await auth();

  // Redirect if not authenticated
  if (!session?.user) {
    redirect("/login");
  }

  // Redirect CUSTOMER back to home if they try to access admin
  const allowedRoles = ["ADMIN", "MANAGER", "WAITER", "KITCHEN", "CASHIER"];
  if (!allowedRoles.includes(session.user.role)) {
    redirect("/");
  }

  return (
    <div className="flex h-screen flex-col md:flex-row overflow-hidden">
      <AdminSidebar className="hidden md:flex" />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <MobileAdminHeader />
        <main className="flex-1 overflow-auto p-4 md:p-8 pt-6">
          {children}
        </main>
      </div>
    </div>
  );
}
