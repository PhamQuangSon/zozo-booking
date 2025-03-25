"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ShoppingCart } from "lucide-react"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ScrollingBanner } from "@/components/scrolling-banner"
import { OrderCart } from "@/components/order-cart"
import { useCurrencyStore } from "@/store/currencyStore"
import { formatCurrency } from "@/lib/i18n"
import { getRestaurantById } from "@/actions/restaurant-actions"
import { getMenuForTable, getTableDetails } from "@/actions/table-actions"
import { CartItem, useCartStore } from "@/store/cartStore"; // Import the Zustand store
import { useToast } from "@/hooks/use-toast"

export default function TableOrderPage({ params }: { params: { restaurantId: string; tableId: string } }) {
  const [restaurant, setRestaurant] = useState<any>({ name: "", description: "", image_url: "", menus: [] })
  const [table, setTable] = useState<any>({ number: "" })
  const [activeCategory, setActiveCategory] = useState("all")
  const [allItems, setAllItems] = useState<any[]>([])
  const [filteredItems, setFilteredItems] = useState<any[]>([])
  const [visibleItems, setVisibleItems] = useState(8)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const loadMoreRef = useRef<HTMLDivElement>(null)
  const { currency } = useCurrencyStore()
	const { toast } = useToast()
  const hasMore = filteredItems.length > visibleItems
  const { addToCart } = useCartStore(); // Access the Zustand store's addToCart function

  // Fetch restaurant and menu data using server actions
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


        const restaurantData = restaurantResult.data
        const tableData = tableResult.data
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
        setFilteredItems(items)
      } catch (err: any) {
        console.error("Error fetching data:", err)
        setError(err.message || "Failed to load data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [params.restaurantId, params.tableId])

  // Filter items when category changes
  useEffect(() => {
    if (activeCategory === "all") {
      setFilteredItems(allItems)
    } else {
      setFilteredItems(allItems.filter((item) => item.categoryName.toLowerCase() === activeCategory))
    }
    // Reset visible items when category changes
    setVisibleItems(8)
  }, [activeCategory, allItems])

  // Infinite scroll implementation
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setVisibleItems((prev) => prev + 4)
        }
      },
      { threshold: 0.1 },
    )

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current)
    }

    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current)
      }
    }
  }, [hasMore, filteredItems])

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category)
  }

  const handleAddToCart = (item: any) => {
    // Create a new cart item
    const cartItem: CartItem = {
      id: item.id,
      name: item.name,
      price: Number(item.price),
      quantity: 1,
      selectedOptions: {}, // Add any selected options if applicable
      specialInstructions: "", // Add any special instructions if applicable
      restaurantId: params.restaurantId, // Include restaurantId for scoping
      tableId: params.tableId, // Include tableId for scoping
    };
  
    // Add the item to the cart using Zustand
    addToCart(cartItem);
  
    // Show toast notification
    toast({
      title: "Added to cart",
      description: `${item.name} has been added to your order.`,
    });
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
          <div className="text-center mb-8 border-b pb-4">
            <div className="flex justify-center items-center gap-2 mb-2">
              <span className="text-amber-500">🍔 FOOD MENU 🍕</span>
            </div>
            <h2 className="text-3xl font-bold mb-6">{restaurant.name} Menu</h2>

            {/* Category Tabs */}
            <div className="flex justify-center gap-4 flex-wrap mb-8">
              <Button
                variant={activeCategory === "all" ? "default" : "outline"}
                onClick={() => handleCategoryChange("all")}
                className="rounded-full"
              >
                <span className="mr-2">🍽️</span>
                All Items
              </Button>
              {restaurant.menus &&
                restaurant.menus.length > 0 &&
                restaurant.menus[0].menu_categories?.map((category: any) => (
                  <Button
                    key={category.id}
                    variant={activeCategory === category.name.toLowerCase() ? "default" : "outline"}
                    onClick={() => handleCategoryChange(category.name.toLowerCase())}
                    className="rounded-full"
                  >
                    <div className="relative h-4 w-4 flex-shrink-0 mr-2">
                      <Image
                        src={category.description || "/placeholder.svg?height=100&width=100"}
                        alt={category.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    {category.name}
                  </Button>
                ))}
            </div>
          </div>

          {/* Menu Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8">
            {filteredItems.slice(0, visibleItems).map((item: any) => (
              <div
                key={item.id}
                className="group flex bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow p-4 gap-4"
              >
                {/* Image */}
                <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-full border-2 border-white shadow-md">
                  <div className="absolute inset-0 bg-black/50 group-hover:bg-transparent transition-colors duration-300"></div>
                  <Image
                    src={item.image_url || "/placeholder.svg?height=100&width=100"}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>
                {/* Content */}
                <div className="flex-1 p-4 relative">
                  {/* Item Name and Price */}
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium group-hover:text-amber-500 transition-colors duration-300">
                      {item.name}
                    </h3>
                    <p className="font-bold text-2xl text-amber-500">{formatCurrency(Number(item.price), currency)}</p>
                  </div>
                  {/* Category */}
                  <p className="text-sm text-gray-500 mb-2">{item.categoryName}</p>
                  {/* Add to Order Button */}
                  <Button
                    size="sm"
                    onClick={() => handleAddToCart(item)}
                    className="mt-auto absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  >
                    <ShoppingCart className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Load More Trigger */}
          {hasMore && (
            <div ref={loadMoreRef} className="h-10 flex items-center justify-center mt-8">
              <p className="text-sm text-gray-500">Loading more items...</p>
            </div>
          )}
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

