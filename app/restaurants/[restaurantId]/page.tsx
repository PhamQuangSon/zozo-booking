"use client"

import Image from "next/image"
import { useState, useEffect, useCallback, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Star, MapPin, ChevronLeft, ShoppingCart } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getRestaurantById } from "@/actions/restaurant-actions"
import { toast } from "@/components/ui/use-toast"
import Link from "next/link"
import { useCurrencyStore } from "@/lib/currency-store"
import { formatCurrency } from "@/lib/i18n"
import { MenuCategory } from "@/components/menu-category"

export default function RestaurantPage() {
  const params = useParams()
  const router = useRouter()
  const restaurantId = params.restaurantId as string
  const tableId = params.tableId as string
  const { currency } = useCurrencyStore()

  const [restaurant, setRestaurant] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [specialItem, setSpecialItem] = useState<any>({
    id: "example-id",
    name: "Example Special Dish",
    price: 12.99,
    image_url: "./restaurant_scene.png",
    categoryName: "Specials",
    discountPercentage: 45,})
  const [visibleItems, setVisibleItems] = useState<number>(8)
  const [hasMore, setHasMore] = useState(true)
  const [allMenuItems, setAllMenuItems] = useState<any[]>([])
  const [activeCategory, setActiveCategory] = useState<string>("all")

  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  const fetchRestaurant = useCallback(async () => {
    try {
      setLoading(true)
      const { success, data, error } = await getRestaurantById(restaurantId)

      if (success && data) {
        setRestaurant(data)

        // Flatten all menu items for infinite scroll
        const items: any[] = []
        if (data.menus && data.menus.length > 0) {
          data.menus.forEach((menu: any) => {
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
  }, [restaurantId, fetchRestaurant])

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category)
    setVisibleItems(8)
    setHasMore(true)
  }

  const filteredItems =
    activeCategory === "all"
      ? allMenuItems
      : allMenuItems.filter((item) => item.categoryName.toLowerCase() === activeCategory.toLowerCase())

  const handleAddToCart = (item: any) => {
    // Get existing cart from localStorage
    const cartKey = `cart-${restaurantId}-${tableId}`
    let cart = []

    try {
      const existingCart = localStorage.getItem(cartKey)
      if (existingCart) {
        cart = JSON.parse(existingCart)
      }
    } catch (e) {
      console.error("Failed to parse cart:", e)
    }

    // Create new cart item
    const cartItem = {
      id: item.id,
      name: item.name,
      price: Number(item.price),
      quantity: 1,
      selectedOptions: {},
      specialInstructions: "",
    }

    // Add to cart
    cart.push(cartItem)

    // Save back to localStorage
    localStorage.setItem(cartKey, JSON.stringify(cart))

    // Show toast
    toast({
      title: "Added to cart",
      description: `${item.name} has been added to your order.`,
    })
  }

  const handleOrderSpecial = () => {
    if (specialItem) {
      handleAddToCart(specialItem)
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  if (!restaurant) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle>Restaurant Not Found</CardTitle>
            <CardDescription>The restaurant you're looking for doesn't exist</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/restaurants">Back to Restaurants</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section with Today's Special */}
      {specialItem && (
        <div className="relative w-full h-[300px] bg-black">
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent z-10"></div>
          <Image
            src={specialItem.image_url ||  "/restaurant_scene.png"}            
            alt="Special food"
            fill
            className="object-cover opacity-80"
          />
          <div className="relative z-20 container mx-auto h-full flex flex-col justify-center text-white">
            <p className="text-red-500 font-medium mb-2">WELCOME {restaurant.name.toUpperCase()}</p>
            <h1 className="text-4xl font-bold mb-2">TODAY SPECIAL FOOD</h1>
            <p className="text-amber-500 mb-4">Limited Time Offer</p>
            <Button onClick={handleOrderSpecial} className="bg-red-600 hover:bg-red-700 text-white w-fit">
              ORDER NOW
            </Button>
          </div>
          <div className="absolute top-10 right-10 z-20 bg-amber-500 text-white rounded-full p-3 rotate-12">
            <p className="font-bold text-lg">{specialItem.discountPercentage}% OFF</p>
          </div>
        </div>
      )}

      {/* Restaurant Info */}
      <div className="container mx-auto py-6">
        <div className="flex items-center mb-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/">
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold ml-2">{restaurant.name}</h1>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <Badge variant="outline">{restaurant.cuisine}</Badge>
          <div className="flex items-center text-sm">
            <Star className="mr-1 h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span>{restaurant.rating?.toFixed(1) || "0.0"}</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="mr-1 h-4 w-4" />
            <span>{restaurant.address}</span>
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
                
                <div className="relative h-4 w-4 flex-shrink-0">
                      <Image
                      src={"/menuIcon1_4.png"}
                      alt="ALl menu"
                      fill
                      className="object-cover "
                    />
                    </div>
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
                    <div className="relative h-4 w-4 flex-shrink-0">
                      <Image
                      src={category.description || "/zozo-booking.png?height=100&width=100"}
                      alt={category.name}
                      fill
                      className="object-cover "
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
                className="flex bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow p-4 gap-4"
              >
                <div className="relative h-24 w-24 flex-shrink-0 round-circle">
                  <Image
                    src={item.image_url || "/zozo-booking.png?height=100&width=100"}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 p-4">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="font-bold text-2xl text-amber-500">{formatCurrency(Number(item.price), currency)}</p>
                  </div>
                  <p className="text-sm text-gray-500 mt-1 mb-2">
                    It's a testament to our {item.categoryName.toLowerCase()}
                  </p>
                  <Button size="sm" onClick={() => handleAddToCart(item)} className="mt-auto">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add to Order
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
      <div className="bg-gray-100 py-4 overflow-hidden whitespace-nowrap">
        <div className="animate-marquee inline-block">
          {Array(10)
            .fill(0)
            .map((_, i) => (
              <span key={i} className="text-3xl text-gray-300 font-bold mx-4">
                CHICKEN PIZZA &nbsp; GRILLED CHICKEN &nbsp; BURGER &nbsp; CHICKEN PASTA &nbsp;
              </span>
            ))}
        </div>
      </div>
    </div>
  )
}

