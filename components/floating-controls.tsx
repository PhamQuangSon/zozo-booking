"use client";

import { usePathname } from "next/navigation";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";

export function FloatingControls() {
  const pathname = usePathname();
  
  // Hide on admin routes, because admin has its own controls
  if (pathname?.includes("/admin")) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-40 flex gap-2">
      <LanguageSwitcher />
      <ThemeToggle />
    </div>
  );
}
