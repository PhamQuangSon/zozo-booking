"use client";

import {
  BookOpen,
  Coffee,
  LayoutDashboard,
  ListOrdered,
  LogOut,
  QrCode,
  ShoppingBag,
  Store,
  Table,
  User,
  Utensils,
  Bot,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { CurrencySelector } from "@/components/currency-selector";
import { RESTAURANT_CHANGE_EVENT, RestaurantSelector } from "@/components/restaurant-selector";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn, safeLocalStorage, safeParseJSON } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";

// Add this near the top of the file, after the imports
function debugLog(message: string, data?: any) {
  if (process.env.NODE_ENV === "development") {
    console.log(`🔍 AdminSidebar Debug: ${message}`, data || "");
  }
}

export function AdminSidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const [defaultRestaurant, setDefaultRestaurant] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const { data: session, status } = useSession();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // Then update the useEffect for session debugging
  useEffect(() => {
    debugLog("Session state changed", {
      status,
      sessionExists: !!session,
      userData: session?.user
        ? {
            id: session.user.id,
            name: session.user.name,
            image: session.user.image,
            bio: session.user.bio,
            email: session.user.email,
            role: session.user.role,
          }
        : null,
    });
    if (session?.user?.image) {
      setAvatarUrl(session.user.image);
    } else if (session?.user?.name) {
      // Use UI Avatars as fallback
      setAvatarUrl(
        `https://ui-avatars.com/api/?name=${encodeURIComponent(session.user.name)}&background=random`,
      );
    }
  }, [session, status]);

  // Update the useEffect to use prisma/seed.ts data and listen for restaurant changes
  useEffect(() => {
    // Fetch the default restaurant
    const fetchDefaultRestaurant = async () => {
      try {
        // In a real app, this would be an API call to fetch restaurants
        // For now, we'll use the data from seed.ts
        const savedRestaurant = safeLocalStorage.getItem("defaultRestaurant");
        const defaultFallback = { id: "1", name: "Pasta Paradise" };

        const restaurant = safeParseJSON(savedRestaurant, defaultFallback);
        setDefaultRestaurant(restaurant);
      } catch (error) {
        console.error("Error fetching restaurants:", error);
      }
    };

    fetchDefaultRestaurant();

    // Listen for restaurant change events
    const handleRestaurantChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ id: string; name: string }>;
      setDefaultRestaurant(customEvent.detail);
    };

    window.addEventListener(RESTAURANT_CHANGE_EVENT, handleRestaurantChange);

    // Clean up event listener
    return () => {
      window.removeEventListener(RESTAURANT_CHANGE_EVENT, handleRestaurantChange);
    };
  }, []);

  const userRole = session?.user?.role;
  const isManagement = userRole === "ADMIN" || userRole === "MANAGER";
  
  // Update the navItems array to include the new pages
  const navItems = [
    {
      title: "Dashboard",
      href: "/admin/dashboard",
      icon: LayoutDashboard,
      roles: ["ADMIN", "MANAGER", "CASHIER"],
    },
    {
      title: "QR Table",
      href: "/admin/qr",
      icon: QrCode,
      roles: ["ADMIN", "MANAGER", "WAITER"],
    },
    {
      title: "Restaurants",
      href: "/admin/restaurants",
      icon: Store,
      roles: ["ADMIN", "MANAGER", "CASHIER", "WAITER", "KITCHEN"],
    },
    {
      title: "Categories",
      href: "/admin/categories",
      icon: ListOrdered,
      roles: ["ADMIN", "MANAGER"],
    },
    {
      title: "Menu Items",
      href: "/admin/menu-items",
      icon: Coffee,
      roles: ["ADMIN", "MANAGER"],
    },
    {
      title: "Item Options",
      href: "/admin/item-options",
      icon: Utensils,
      roles: ["ADMIN", "MANAGER"],
    },
  ].filter((item) => !userRole || item.roles.includes(userRole));

  // Update the restaurantNavItems array to include view order and Item Options
  const restaurantNavItems = defaultRestaurant
    ? [
        {
          title: "Overview",
          href: `/admin/restaurants/${defaultRestaurant.id}`,
          icon: Store,
          roles: ["ADMIN", "MANAGER", "CASHIER"],
        },
        {
          title: "POS / Cashier",
          href: `/admin/restaurants/${defaultRestaurant.id}/pos`,
          icon: Store, // Or any suitable icon
          roles: ["ADMIN", "MANAGER", "CASHIER"],
        },
        {
          title: "Kitchen Display (KDS)",
          href: `/admin/restaurants/${defaultRestaurant.id}/kds`,
          icon: Coffee,
          roles: ["ADMIN", "MANAGER", "KITCHEN"],
        },
        {
          title: "Orders",
          href: `/admin/restaurants/${defaultRestaurant.id}/orders`,
          icon: ShoppingBag,
          roles: ["ADMIN", "MANAGER", "CASHIER", "WAITER"],
        },
        {
          title: "List Tables",
          href: `/admin/restaurants/${defaultRestaurant.id}/tables`,
          icon: Table,
          roles: ["ADMIN", "MANAGER", "CASHIER", "WAITER"],
        },
        {
          title: "Menu Builder",
          href: `/admin/restaurants/${defaultRestaurant.id}/menu`,
          icon: BookOpen,
          roles: ["ADMIN", "MANAGER"],
        },
        {
          title: "AI Chatbot",
          href: `/admin/restaurants/${defaultRestaurant.id}/chatbot`,
          icon: Bot,
          roles: ["ADMIN", "MANAGER"],
        },
      ].filter((item) => !userRole || item.roles.includes(userRole))
    : [];

  const handleSignOut = () => {
    signOut({ callbackUrl: "/login" });
  };

  return (
    <div className={cn("flex h-screen w-64 flex-col border-r bg-card", className)}>
      <div className="flex h-14 items-center border-b px-4 shrink-0">
        <Link href="/admin/dashboard" className="flex items-center gap-2 font-semibold text-primary">
          <Store className="h-5 w-5" />
          <span>Zozo Booking Admin</span>
        </Link>
      </div>
      
      {/* Move Restaurant Selector to Top Context */}
      <div className="px-4 py-3 border-b bg-muted/20">
        <RestaurantSelector />
      </div>

      <ScrollArea className="flex-1">
        <div className="flex-1 overflow-auto py-4 space-y-6">
          <div className="px-2">
            <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              System
            </h3>
            <nav className="grid gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 text-sm font-medium transition-colors",
                    pathname === item.href 
                      ? "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-l-4 border-orange-500 rounded-r-md" 
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-md border-l-4 border-transparent"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.title}
                </Link>
              ))}
            </nav>
          </div>

          {defaultRestaurant && restaurantNavItems.length > 0 && (
            <div className="px-2">
              <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Store className="w-3 h-3" />
                Store Management
              </h3>
              <nav className="grid gap-1">
                {restaurantNavItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 text-sm font-medium transition-colors",
                      pathname === item.href 
                        ? "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-l-4 border-orange-500 rounded-r-md" 
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-md border-l-4 border-transparent"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.title}
                  </Link>
                ))}
              </nav>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="border-t bg-muted/20 p-4 space-y-4 shrink-0">
        {status === "loading" ? (
          <div className="flex items-center justify-center py-2">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : status === "authenticated" && session?.user ? (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <CurrencySelector />
              <div className="flex items-center gap-1">
                <LanguageSwitcher />
                <ThemeToggle />
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-3 w-full justify-start h-auto py-2 px-2 hover:bg-accent">
                  <Avatar className="h-9 w-9 border">
                    {avatarUrl ? (
                      <AvatarImage src={avatarUrl} alt={session?.user?.name || "User"} />
                    ) : (
                      <AvatarFallback>
                        {session?.user?.name?.charAt(0) || session?.user?.email?.charAt(0) || "U"}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex flex-col items-start text-sm truncate flex-1">
                    <span className="font-semibold truncate w-full text-left">{session.user.name || "User"}</span>
                    <span className="text-xs text-muted-foreground truncate w-full text-left">{session.user.email}</span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/admin/profile">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <Button variant="outline" className="w-full justify-start" asChild>
            <Link href="/login">
              <LogOut className="mr-2 h-4 w-4" />
              Login
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
