"use client";

import { Menu } from "lucide-react";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { AdminSidebar } from "@/components/admin-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";

export function MobileAdminHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close the sheet when navigation happens
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="md:hidden flex items-center justify-between p-4 border-b bg-background sticky top-0 z-40">
      <div className="font-semibold text-lg flex-1">Zozo Booking</div>
      
      <div className="flex items-center gap-2 mr-2">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle Sidebar</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-72">
          {/* We reuse the AdminSidebar inside the sheet */}
          <div className="h-full">
            <AdminSidebar />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
