"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ShoppingCart } from "lucide-react"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ScrollingBanner } from "@/components/scrolling-banner"
import { OrderCart } from "@/components/order-cart"
import { MenuCategory } from "@/components/menu-category"
import { useCurrencyStore } from "@/store/currencyStore"
import { useCartStore } from "@/store/cartStore"
import { getRestaurantById } from "@/actions/restaurant-actions"
import { getTableDetails, getTableOrders } from "@/actions/table-actions"

export default function TableOrderPage({ params }: { params: { restaurantId: string; tableId: string } }) {
  const [restaurant, setRestaurant] = useState<any>({ name: "", description: "", image_url: "", menus: [] })
  const [table, setTable] = useState<any>({ number: "" })
  const [activeCategory, setActiveCategory] = useState("all")
  const [allItems, setAllItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { currency } = useCurrencyStore()
  const { syncServerOrders } = useCartStore()

  // Fetch restaurant, menu data, and orders using server actions
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Get restaurant data using server action
        const restaurantResult = await getRestaurantById(params.restaurantId)
        if (!restaurantResult.success || !restaurantResult.data) {
          throw new Error(restaurantResult.error || "Failed to load restaurant")
        }

        // Get table data using server action
        const tableResult = await getTableDetails(params.tableId)
        if (!tableResult.success || !tableResult.data) {
          throw new Error(tableResult.error || "Failed to load table")
        }

        // Fetch active orders for this table
        const ordersResult = await getTableOrders(params.restaurantId, params.tableId)
        if (!ordersResult.success) {
          throw new Error(ordersResult.error || "Failed to load orders")
        }

        const restaurantData = restaurantResult.data
        const tableData = tableResult.data

        // Sync server orders with cart state
        if (ordersResult.data) {
          syncServerOrders(params.restaurantId, params.tableId, ordersResult.data)
        }
        setRestaurant(restaurantData)
        setTable(tableData)

        // Flatten all menu items for infinite scroll
        const items: any[] = []
        if (restaurantData.menus && restaurantData.menus.length > 0) {
          restaurantData.menus.forEach((menu: any) => {
            menu.menu_categories?.forEach((category: any) => {
              category.menu_items.forEach((item: any) => {
                items.push({
                  ...item,
                  categoryName: category.name,
                  categoryId: category.id,
                })
              })
            })
          })
        }

        setAllItems(items)
      } catch (err: any) {
        console.error("Error fetching data:", err)
        setError(err.message || "Failed to load data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [params.restaurantId, params.tableId])

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category)
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="h-screen flex items-center justify-center">
          <div className="animate-pulse space-y-8 w-full max-w-3xl">
            <div className="h-48 bg-gray-200 rounded-lg"></div>
            <div className="h-8 bg-gray-200 rounded-md w-1/3 mx-auto"></div>
            <div className="h-4 bg-gray-200 rounded-md w-2/3 mx-auto"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-500">Error</h2>
            <p className="mt-2">{error}</p>
            <Button asChild className="mt-4">
              <Link href="/restaurants">Go Back</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen flex flex-col">
      {/* Header Section */}
      <div className="bg-gradient-to-b from-amber-50 to-white py-6">
        <div className="container mx-auto px-4">
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <Link href={`/restaurants/${params.restaurantId}`}>
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back to Restaurant
            </Link>
          </Button>

          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-white shadow-lg">
              <Image
                src={restaurant.image_url || "/placeholder.svg?height=400&width=400"}
                alt={restaurant.name}
                fill
                className="object-cover"
              />
            </div>

            <div className="text-center md:text-left">
              <h1 className="text-3xl font-bold">{restaurant.name}</h1>
              <p className="mt-2 text-muted-foreground max-w-md">{restaurant.description}</p>
              <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full bg-amber-100 text-amber-800">
                <span className="font-medium">Table {table.number}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Food Menu Section */}
      <div className="bg-gray-50 flex-grow py-8">
        <div className="container mx-auto bg-white p-8 rounded-t-3xl shadow-lg">
          <div className="flex justify-center items-center gap-2 mb-2">
            <span className="text-amber-500">🍔 FOOD MENU 🍕</span>
          </div>
          <h2 className="text-3xl font-bold mb-6 text-center">{restaurant.name} Menu</h2>

          <MenuCategory
            items={allItems}
            activeCategory={activeCategory}
            onCategoryChange={handleCategoryChange}
            categories={restaurant.menus?.[0]?.menu_categories || []}
          />
        </div>
      </div>

      {/* Scrolling Text Banner */}
      <ScrollingBanner text="CHICKEN PIZZA   GRILLED CHICKEN   BURGER   CHICKEN PASTA" />

      {/* View Order Sheet */}
      <div className="fixed bottom-6 right-6 z-50">
        <Sheet>
          <SheetTrigger asChild>
            <Button size="lg" className="rounded-full shadow-lg">
              <ShoppingCart className="h-5 w-5 mr-2" />
              View Order
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full sm:max-w-md">
            <SheetHeader>
              <SheetTitle>Your Order</SheetTitle>
              <SheetDescription>
                Table {table.number} at {restaurant.name}
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6 h-[calc(100vh-180px)]">
              <OrderCart restaurantId={params.restaurantId} tableId={params.tableId} />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </main>
  )
}

