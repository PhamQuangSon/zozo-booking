"use client"

import Image from "next/image"
import { useState, useEffect, useCallback, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Star, MapPin, ChevronLeft, Table, ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { getRestaurantById } from "@/actions/restaurant-actions"
import { getRestaurantTables } from "@/actions/table-actions"
import { toast } from "@/components/ui/use-toast"
import Link from "next/link"
import { useCurrencyStore } from "@/store/currencyStore"
import { formatCurrency } from "@/lib/i18n"
import { ScrollingBanner } from "@/components/scrolling-banner"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import Loading from "@/app/loading"

export default function RestaurantPage() {
  const params = useParams()
  const router = useRouter()
  const restaurantId = params.restaurantId as string
  const { currency } = useCurrencyStore()

  const [restaurant, setRestaurant] = useState<any>(null)
  const [tables, setTables] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tableLoading, setTableLoading] = useState(false)
  const [specialItem, setSpecialItem] = useState<any>()
  const [visibleItems, setVisibleItems] = useState<number>(8)
  const [hasMore, setHasMore] = useState(true)
  const [allMenuItems, setAllMenuItems] = useState<any[]>([])
  const [activeCategory, setActiveCategory] = useState<string>("all")
  const [showTableDialog, setShowTableDialog] = useState(true)

  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  const fetchRestaurant = useCallback(async () => {
    try {
      setLoading(true)
      const { success, data: restaurant, error } = await getRestaurantById(restaurantId)

      if (success && restaurant) {
        setRestaurant(restaurant)

        // Flatten all menu items for infinite scroll
        const items: any[] = []
        if (restaurant.categories && restaurant.categories.length > 0) {
          restaurant.categories?.forEach((category: any) => {
            category.items.forEach((item: any) => {
              items.push({
                ...item,
                categoryName: category.name,
                categoryId: category.id,
              })
            })
          })
        }
        setAllMenuItems(items)

        // Set a random item as special
        if (items.length > 0) {
          const randomIndex = Math.floor(Math.random() * items.length)
          setSpecialItem({
            ...items[randomIndex],
            discountPercentage: 45,
          })
        }
      } else {
        toast({
          title: "Error",
          description: error || "Failed to fetch restaurant details",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching restaurant:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [restaurantId])

  const fetchTables = useCallback(async () => {
    try {
      setTableLoading(true)
      const { success, data, error } = await getRestaurantTables(restaurantId)

      if (success && data) {
        setTables(data)
      } else {
        toast({
          title: "Error",
          description: error || "Failed to fetch tables",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching tables:", error)
      toast({
        title: "Error",
        description: "Failed to load tables",
        variant: "destructive",
      })
    } finally {
      setTableLoading(false)
    }
  }, [restaurantId])

  // Setup intersection observer for infinite scrolling
  useEffect(() => {
    if (loadMoreRef.current && !observerRef.current) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          const [entry] = entries
          if (entry.isIntersecting && hasMore) {
            loadMoreItems()
          }
        },
        { threshold: 0.1 },
      )

      observerRef.current.observe(loadMoreRef.current)
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [hasMore, allMenuItems, visibleItems])

  const loadMoreItems = () => {
    if (visibleItems >= allMenuItems.length) {
      setHasMore(false)
      return
    }

    setVisibleItems((prev) => prev + 4)
  }

  useEffect(() => {
    fetchRestaurant()
    fetchTables()
  }, [restaurantId, fetchRestaurant, fetchTables])

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category)
    setVisibleItems(8)
    setHasMore(true)
  }

  const filteredItems =
    activeCategory === "all"
      ? allMenuItems
      : allMenuItems.filter((item) => item.categoryName.toLowerCase() === activeCategory.toLowerCase())

  const handleTableSelect = (tableId: number) => {
    router.push(`/restaurants/${restaurantId}/${tableId}`)
  }

  const handleViewMenu = () => {
    setShowTableDialog(true)
  }

  if (loading) {
    return <Loading />
  }

  if (!restaurant) {
    return (
      <div className="container mx-auto py-10">
        <Card className="glass-card overflow-hidden">
          <CardHeader>
            <CardTitle>Restaurant Not Found</CardTitle>
            <CardDescription>The restaurant you're looking for doesn't exist</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="rounded-full glass-button">
              <Link href="/restaurants">Back to Restaurants</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Table Selection Dialog */}
      <Dialog open={showTableDialog} onOpenChange={setShowTableDialog}>
        <DialogContent className="sm:max-w-md glass-card border-0">
          <DialogHeader>
            <DialogTitle>Select a Table</DialogTitle>
            <DialogDescription>Choose a table to view the menu and place your order.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 py-4">
            {tableLoading ? (
              <div className="col-span-full flex justify-center py-8">
                <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
              </div>
            ) : tables.length === 0 ? (
              <div className="col-span-full text-center py-4">
                <p className="text-muted-foreground">No tables available</p>
              </div>
            ) : (
              tables.map((table) => (
                <Button
                  key={table.id}
                  variant={table.status === "AVAILABLE" ? "outline" : "secondary"}
                  disabled={table.status !== "AVAILABLE"}
                  onClick={() => handleTableSelect(table.id)}
                  className={`h-auto py-4 flex flex-col items-center gap-2 rounded-2xl transition-all duration-300 ${
                    table.status === "AVAILABLE"
                      ? "glass-button hover:shadow-lg hover:translate-y-[-2px]"
                      : "bg-gray-100/50 backdrop-blur-sm"
                  }`}
                >
                  <Table className="h-6 w-6" />
                  <span>Table {table.number}</span>
                  <span className="text-xs text-muted-foreground">
                    {table.status === "AVAILABLE" ? "Available" : "Occupied"}
                  </span>
                </Button>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Hero Section with Today's Special */}
      {specialItem && (
        <div className="relative w-full h-[300px] bg-black overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent z-10"></div>
          <Image
            src={"/special-bg.jpg?height=400&width=600"}
            alt="Special food background"
            fill
            className="object-cover opacity-50"
          />

          {/* Special Item Image with Animation */}
          <div className="absolute right-[20%] top-[10%] z-20 animate-float">
            <div className="relative h-[300px] w-[300px]">
              <Image
                src={"/ctaThumb1_1.png"}
                alt={specialItem.name}
                fill
                className="object-contain drop-shadow-2xl"
              />
            </div>
          </div>

          <div className="relative z-20 container mx-auto h-full flex flex-col justify-center text-white pl-8">
            <p className="text-red-500 font-medium mb-2">WELCOME TO {restaurant.name.toUpperCase()}</p>
            <h1 className="text-4xl font-bold mb-2">TODAY SPECIAL FOOD</h1>
            <p className="text-amber-500 mb-4">Limited Time Offer</p>
            <Button
              onClick={handleViewMenu}
              className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white w-fit rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
            >
              VIEW MENU
            </Button>
          </div>

          {/* Discount Badge with Animation */}
          {/* <div className="absolute top-10 right-[30%] z-20 animate-pulse bg-amber-500 text-white rounded-full p-3 rotate-12">
            <div className="text-red-600 rounded-full flex items-center justify-center font-bold">
              {specialItem.discountPercentage} OFF
            </div>
          </div> */}
        </div>
      )}

      {/* Restaurant Info */}
      <div className="container mx-auto py-6">
        <div className="flex items-center mb-4">
          <Button variant="ghost" size="icon" asChild className="rounded-full hover:bg-white/20 backdrop-blur-sm">
            <Link href="/">
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold ml-2">{restaurant.name}</h1>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <Badge variant="outline" className="glass-card px-3 py-1">
            {restaurant.cuisine}
          </Badge>
          <div className="flex items-center text-sm glass-card px-3 py-1 rounded-full">
            <Star className="mr-1 h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span>{restaurant.rating?.toFixed(1) || "0.0"}</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground glass-card px-3 py-1 rounded-full">
            <MapPin className="mr-1 h-4 w-4" />
            <span>{restaurant.address}</span>
          </div>
        </div>

        {/* Table Selection Card */}
        <Card className="mb-8 glass-card border-0 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-white/80 to-white/40 backdrop-blur-sm">
            <CardTitle>Dining at {restaurant.name}</CardTitle>
            <CardDescription>Select a table to view the menu and place your order</CardDescription>
          </CardHeader>
          <CardContent className="bg-white/30 backdrop-blur-sm">
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
              {tableLoading ? (
                <div className="col-span-full flex justify-center py-8">
                  <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                </div>
              ) : tables.length === 0 ? (
                <div className="col-span-full text-center py-4">
                  <p className="text-muted-foreground">No tables available</p>
                </div>
              ) : (
                tables.slice(0, 6).map((table) => (
                  <Button
                    key={table.id}
                    variant={table.status === "AVAILABLE" ? "outline" : "secondary"}
                    disabled={table.status !== "AVAILABLE"}
                    onClick={() => handleTableSelect(table.id)}
                    className={`h-auto py-4 flex flex-col items-center gap-2 rounded-2xl transition-all duration-300 ${
                      table.status === "AVAILABLE"
                        ? "glass-button hover:shadow-lg hover:translate-y-[-2px]"
                        : "bg-gray-100/50 backdrop-blur-sm"
                    }`}
                  >
                    <Table className="h-6 w-6" />
                    <span>Table {table.number}</span>
                    <span className="text-xs text-muted-foreground">
                      {table.status === "AVAILABLE" ? "Available" : "Occupied"}
                    </span>
                  </Button>
                ))
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-center bg-white/20 backdrop-blur-sm">
            <Button
              onClick={() => setShowTableDialog(true)}
              className="rounded-full glass-button hover:shadow-lg transition-all duration-300"
            >
              View All Tables
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Restaurant Information Section */}
      <div className="bg-gradient-to-b from-gray-50/50 to-white/80 backdrop-blur-sm flex-grow py-8">
        <div className="container mx-auto glass-card p-8 rounded-[40px] shadow-lg">
          <div className="text-center mb-8 border-b border-white/20 pb-4">
            <div className="flex justify-center items-center gap-2 mb-2">
              <span className="text-amber-500">🍔 ABOUT US 🍕</span>
            </div>
            <h2 className="text-3xl font-bold mb-6">Welcome to {restaurant.name}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {restaurant.description ||
                `Experience the finest ${restaurant.cuisine} cuisine in town. Our chefs prepare each dish with fresh ingredients and authentic recipes.`}
            </p>
          </div>

          {/* Restaurant Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="glass-card border-0 hover:shadow-xl transition-all duration-300 hover:translate-y-[-5px]">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="mr-2">🍽️</span> Cuisine
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>{restaurant.cuisine}</p>
              </CardContent>
            </Card>
            <Card className="glass-card border-0 hover:shadow-xl transition-all duration-300 hover:translate-y-[-5px]">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="mr-2">⏰</span> Hours
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>Mon-Fri: 11am - 10pm</p>
                <p>Sat-Sun: 10am - 11pm</p>
              </CardContent>
            </Card>
            <Card className="glass-card border-0 hover:shadow-xl transition-all duration-300 hover:translate-y-[-5px]">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="mr-2">📍</span> Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>{restaurant.address}</p>
              </CardContent>
            </Card>
          </div>

          {/* Call to Action */}
          <div className="text-center py-8">
            <h3 className="text-2xl font-bold mb-4">Ready to Order?</h3>
            <p className="text-muted-foreground mb-6">Select a table to view our menu and place your order</p>
            <Button
              size="lg"
              onClick={() => setShowTableDialog(true)}
              className="rounded-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Select a Table <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Scrolling Text Banner */}
      <ScrollingBanner text="CHICKEN PIZZA   GRILLED CHICKEN   BURGER   CHICKEN PASTA" />
    </div>
  )
}
