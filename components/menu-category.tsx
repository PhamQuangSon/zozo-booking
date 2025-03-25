"use client"

import Image from "next/image"
import { ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { MenuItemDetail } from "@/components/menu-item-detail"
import { useCurrencyStore } from "@/store/currencyStore"
import { formatCurrency } from "@/lib/i18n"
import { useParams } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { useState, useRef, useEffect } from "react"
import { type CartItem, useCartStore } from "@/store/cartStore"

interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  image_url?: string
  categoryName: string
  options?: any[]
}

interface MenuCategoryProps {
  items: MenuItem[]
  activeCategory: string
  onCategoryChange: (category: string) => void
  categories?: any[]
}

export function MenuCategory({ items, activeCategory, onCategoryChange, categories = [] }: MenuCategoryProps) {
  const { currency } = useCurrencyStore()
  const params = useParams()
  const { toast } = useToast()
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([])
  const [visibleItems, setVisibleItems] = useState(8)
  const loadMoreRef = useRef<HTMLDivElement>(null)
  const { addToCart } = useCartStore()

  const hasMore = filteredItems.length > visibleItems

  // Filter items when category changes
  useEffect(() => {
    if (activeCategory === "all") {
      setFilteredItems(items)
    } else {
      setFilteredItems(items.filter((item) => item.categoryName.toLowerCase() === activeCategory))
    }
    // Reset visible items when category changes
    setVisibleItems(8)
  }, [activeCategory, items])

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

  const handleAddToCart = (item: MenuItem, options?: any, quantity?: number, specialInstructions?: string) => {
    if (!params.restaurantId || !params.tableId) {
      toast({
        title: "Error",
        description: "Missing restaurant or table information",
        variant: "destructive",
      })
      return
    }
    console.log("Adding item to cart:", item, options, quantity, specialInstructions);
    // Create a new cart item
    const cartItem: CartItem = {
      id: item.id,
      name: item.name,
      price: Number(item.price),
      quantity: quantity || 1,
      selectedOptions: options || {},
      specialInstructions: specialInstructions || "",
      restaurantId: params.restaurantId as string,
      tableId: params.tableId as string,
    }

    // Add the item to the cart using Zustand
    addToCart(cartItem)

    // Show toast notification
    toast({
      title: "Added to cart",
      description: `${item.name} has been added to your order.`,
    })

    // Close dialog if open
    setDialogOpen(false)
  }

  return (
    <div>
      {/* Category Tabs */}
      <div className="text-center mb-8 border-b pb-4">
        <div className="flex justify-center gap-4 flex-wrap mb-8">
          <Button
            variant={activeCategory === "all" ? "default" : "outline"}
            onClick={() => onCategoryChange("all")}
            className="rounded-full"
          >
            <span className="mr-2">🍽️</span>
            All Items
          </Button>
          {categories.map((category: any) => (
            <Button
              key={category.id}
              variant={activeCategory === category.name.toLowerCase() ? "default" : "outline"}
              onClick={() => onCategoryChange(category.name.toLowerCase())}
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
        {filteredItems.slice(0, visibleItems).map((item) => (
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
                <Dialog
                  open={dialogOpen && selectedItem?.id === item.id}
                  onOpenChange={(open) => {
                    setDialogOpen(open)
                    if (!open) setSelectedItem(null)
                  }}
                >
                  <DialogTrigger asChild>
                    <Button variant="link" className="h-auto p-0 text-left" onClick={() => setSelectedItem(item)}>
                      <h3 className="font-medium group-hover:text-amber-500 transition-colors duration-300">
                        {item.name}
                      </h3>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>{item.name}</DialogTitle>
                    </DialogHeader>
                    {selectedItem && (
                      <MenuItemDetail
                        item={selectedItem}
                        onAddToCart={(options, quantity, specialInstructions) =>
                          handleAddToCart(selectedItem, options, quantity, specialInstructions)
                        }
                      />
                    )}
                  </DialogContent>
                </Dialog>
                <p className="font-bold text-2xl text-amber-500">{formatCurrency(Number(item.price), currency)}</p>
              </div>
              {/* Category */}
              <p className="text-sm text-gray-500 mb-2">{item.categoryName}</p>
              {/* Add to Order Button */}
              <Button
                size="sm"
                onClick={() => {
                  setSelectedItem(item)
                  setDialogOpen(true)
                }}
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
  )
}

