"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Store,
  LogOut,
  ChevronDown,
  ShoppingBag,
  QrCode,
  Table,
  BookOpen,
  ListOrdered,
  Coffee,
  Utensils,
  User,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { CurrencySelector } from "@/components/currency-selector"
import { useState, useEffect } from "react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ScrollArea } from "@/components/ui/scroll-area"
import { RestaurantSelector, RESTAURANT_CHANGE_EVENT } from "@/components/restaurant-selector"
import { useSession, signOut } from "next-auth/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function AdminSidebar() {
  const pathname = usePathname()
  const [defaultRestaurant, setDefaultRestaurant] = useState<{ id: string; name: string } | null>(null)
  const [isRestaurantOpen, setIsRestaurantOpen] = useState(true)
  const { data: session } = useSession()

  // Update the useEffect to use prisma/seed.ts data and listen for restaurant changes
  useEffect(() => {
    // Fetch the default restaurant
    const fetchDefaultRestaurant = async () => {
      try {
        // In a real app, this would be an API call to fetch restaurants
        // For now, we'll use the data from seed.ts
        const savedRestaurant = localStorage.getItem("defaultRestaurant")

        if (savedRestaurant) {
          try {
            setDefaultRestaurant(JSON.parse(savedRestaurant))
          } catch (e) {
            console.error("Failed to parse saved restaurant:", e)
            // Fallback to a default from seed data
            setDefaultRestaurant({ id: "1", name: "Pasta Paradise" })
          }
        } else {
          // Set a default from seed data if none is saved
          setDefaultRestaurant({ id: "1", name: "Pasta Paradise" })
        }
      } catch (error) {
        console.error("Error fetching restaurants:", error)
      }
    }

    fetchDefaultRestaurant()

    // Listen for restaurant change events
    const handleRestaurantChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ id: string; name: string }>
      setDefaultRestaurant(customEvent.detail)
    }

    window.addEventListener(RESTAURANT_CHANGE_EVENT, handleRestaurantChange)

    // Clean up event listener
    return () => {
      window.removeEventListener(RESTAURANT_CHANGE_EVENT, handleRestaurantChange)
    }
  }, [])

  // Update the navItems array to include the new pages
  const navItems = [
    {
      title: "Dashboard",
      href: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "QR Table",
      href: "/admin/qr",
      icon: QrCode,
    },
    {
      title: "Restaurants",
      href: "/admin/restaurants",
      icon: Store,
    },
    {
      title: "Categories",
      href: "/admin/categories",
      icon: ListOrdered,
    },
    {
      title: "Menu Items",
      href: "/admin/menu-items",
      icon: Coffee,
    },
    {
      title: "Item Options",
      href: "/admin/item-options",
      icon: Utensils,
    },
  ]

  // Update the restaurantNavItems array to include view order and Item Options
  const restaurantNavItems = defaultRestaurant
    ? [
        {
          title: "Overview",
          href: `/admin/restaurants/${defaultRestaurant.id}`,
          icon: Store,
        },
        {
          title: "Orders",
          href: `/admin/restaurants/${defaultRestaurant.id}/orders`,
          icon: ShoppingBag,
        },
        {
          title: "List Tables",
          href: `/admin/restaurants/${defaultRestaurant.id}/tables`,
          icon: Table,
        },
        {
          title: "Menu Builder",
          href: `/admin/restaurants/${defaultRestaurant.id}/menu`,
          icon: BookOpen,
        },
      ]
    : []

  const handleSignOut = () => {
    signOut({ callbackUrl: "/login" })
  }

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-muted/40">
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/admin/dashboard" className="flex items-center gap-2 font-semibold">
          <Store className="h-5 w-5" />
          <span>Zozo Booking Admin</span>
        </Link>
      </div>

      <ScrollArea className="flex-1">
        <div className="flex-1 overflow-auto py-4">
          <nav className="grid gap-1 px-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                  pathname === item.href ? "bg-accent text-accent-foreground" : "transparent",
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.title}
              </Link>
            ))}
          </nav>

          {defaultRestaurant && (
            <div className="mt-6">
              <Collapsible open={isRestaurantOpen} onOpenChange={setIsRestaurantOpen} className="px-2">
                <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground">
                  <div className="flex items-center gap-3">
                    <Store className="h-4 w-4" />
                    <span>{defaultRestaurant.name}</span>
                  </div>
                  <ChevronDown className={cn("h-4 w-4 transition-transform", isRestaurantOpen && "rotate-180")} />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="mt-1 space-y-1 pl-7">
                    {restaurantNavItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                          pathname === item.href ? "bg-accent text-accent-foreground" : "transparent",
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.title}
                      </Link>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="border-t p-4 space-y-4">
        <div className="flex flex-col gap-3">
          <RestaurantSelector />
          <CurrencySelector />
        </div>

        {session?.user ? (
          <div className="flex items-center justify-between">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 w-full justify-start">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={`https://ui-avatars.com/api/?name=${session.user.name}`} />
                    <AvatarFallback>{session.user.name?.charAt(0) || session.user.email?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start text-sm">
                    <span className="font-medium">{session.user.name}</span>
                    <span className="text-xs text-muted-foreground">{session.user.email}</span>
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
  )
}

