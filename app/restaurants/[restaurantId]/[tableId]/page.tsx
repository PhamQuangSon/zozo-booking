"use client"

import React, { useEffect, useState, use } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ShoppingCart } from "lucide-react"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ScrollingBanner } from "@/components/scrolling-banner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { OrderCart } from "@/components/order-cart"
import { MenuCategory } from "@/components/menu-category"
import { useCurrencyStore } from "@/store/currencyStore"
import { useCartStore } from "@/store/cartStore"
import { getTableFullData } from "@/actions/table-actions"
import { CustomerInfoForm } from "@/components/customer-info-form"
import { useSession } from "next-auth/react"
import { useToast } from "@/hooks/use-toast"


export default function TableOrderPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const { toast } = useToast()
  const { currency } = useCurrencyStore()

  const restaurantId = params.restaurantId as string
  const tableId = params.tableId as string
  const [customerInfoSubmitted, setCustomerInfoSubmitted] = useState(false)
  const [showCustomerForm, setShowCustomerForm] = useState(false)

  const [tableData, setTableData] = useState<any>({
    restaurant: { name: "", description: "", imageUrl: "", categories: [] },
    table: { number: "" },
    orders: [],
  })
  const [activeCategory, setActiveCategory] = useState("all")
  const [allItems, setAllItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { syncServerOrders } = useCartStore()

  // Fetch all data using a single server action
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Get all data in one call
        const result = await getTableFullData(restaurantId, tableId)
        if (!result.success || !result.data) {
          throw new Error(result.error || "Failed to load data")
        }

        const { table, restaurant, orders } = result.data

        // Sync server orders with cart state
        if (orders && Array.isArray(orders)) {
          syncServerOrders(restaurantId, tableId, orders)
        }

        setTableData({
          restaurant,
          table,
          orders,
        })

        // Flatten all menu items for display
        const items: any[] = []
        if (restaurant.categories && Array.isArray(restaurant.categories)) {
          restaurant.categories.forEach((category: any) => {
            if (category.items && Array.isArray(category.items)) {
              category.items.forEach((item: any) => {
                items.push({
                  ...item,
                  categoryName: category.name,
                  categoryId: category.id,
                })
              })
            }
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
  }, [restaurantId, tableId, syncServerOrders])

  // Check if customer info is needed
  useEffect(() => {
    // If user is logged in, we don't need customer info
    if (session?.user) {
      setCustomerInfoSubmitted(true)
      return
    }

    // Check if customer info is already in localStorage
    const savedName = localStorage.getItem("customerName")
    const savedEmail = localStorage.getItem("customerEmail")

    if (savedName && savedEmail) {
      setCustomerInfoSubmitted(true)
    } else {
      setShowCustomerForm(true)
    }
  }, [session])

  const handleCustomerInfoSubmit = (name: string, email: string) => {
    setCustomerInfoSubmitted(true)
    setShowCustomerForm(false)
  }

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category)
  }

  const { restaurant, table } = tableData

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
            <Link href={`/restaurants/${restaurantId}`}>
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back to Restaurant
            </Link>
          </Button>

          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-white shadow-lg">
              <Image
                src={
                  restaurant.imageUrl || "/placeholder.svg?height=400&width=400"
                }
                alt={restaurant.name}
                fill
                className="object-cover animate animate-jump-in animate-duration-1000 animate-delay-300"
              />
            </div>

            <div className="text-center md:text-left">
              <h1 className="text-3xl font-bold animate animate-fade-up">{restaurant.name ?? ""}</h1>
              <p className="mt-2 text-muted-foreground max-w-md">
                {restaurant.description ?? ""}
              </p>
              <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full bg-amber-100 text-amber-800 animate animate-fade-right">
                <span className="font-medium">Table {table.number}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {showCustomerForm && !customerInfoSubmitted ? (
        <div className="container mx-auto my-6 bg-white p-4 md:p-8 rounded-t-3xl shadow-lg w-96 h-[400px]">
          <CustomerInfoForm onSubmit={handleCustomerInfoSubmit} />
        </div>
      ) : (
        <div className="bg-gray-50 flex-grow py-8">
          {/* Food Menu Section */}
          <div className="container mx-auto bg-white p-4 md:p-8 rounded-t-3xl shadow-lg">
            <div className="flex justify-center items-center gap-2 mb-2">
              <span className="text-amber-500">🍔 FOOD MENU 🍕</span>
            </div>
            <h2 className="text-3xl font-bold mb-6 text-center animate animate-fade-up">
              {restaurant.name} Menu
            </h2>

            <MenuCategory
              items={allItems}
              activeCategory={activeCategory}
              onCategoryChange={handleCategoryChange}
              categories={restaurant.categories || []}
            />
          </div>
        </div>
      )}

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
              <OrderCart restaurantId={restaurantId} tableId={tableId} />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </main>
  );
}

