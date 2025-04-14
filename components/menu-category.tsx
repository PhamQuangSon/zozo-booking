"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatCurrency } from "@/lib/i18n"
import { useCurrencyStore } from "@/store/currency-store"
import Image from "next/image"
import { ShoppingCart } from "lucide-react"

interface MenuCategoryProps {
  items: any[]
  activeCategory?: string
  onCategoryChange?: (category: string) => void
  categories?: any[]
  onItemClick?: (item: any) => void
}

export function MenuCategory({
  items = [],
  activeCategory = "all",
  onCategoryChange,
  categories = [],
  onItemClick,
}: MenuCategoryProps) {
  const { currency } = useCurrencyStore()
  const [selectedCategory, setSelectedCategory] = useState(activeCategory)

  // Extract unique categories from items if not provided
  const uniqueCategories =
    categories.length > 0
      ? categories
      : Array.from(new Set(items.map((item) => item.categoryName))).map((name) => ({ name }))

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    if (onCategoryChange) {
      onCategoryChange(category)
    }
  }

  // Filter items by category
  const filteredItems =
    selectedCategory === "all"
      ? items
      : items.filter((item) => item.categoryName?.toLowerCase() === selectedCategory.toLowerCase())

  return (
    <div className="space-y-6">
      <Tabs defaultValue={selectedCategory} onValueChange={handleCategoryChange}>
        <TabsList className="flex flex-wrap justify-center mb-6 bg-white/40 backdrop-blur-sm p-1">
          <TabsTrigger
            value="all"
            className="rounded-full data-[state=active]:bg-white/60 data-[state=active]:shadow-md transition-all"
          >
            <span className="mr-2">🍽️</span>
            All
          </TabsTrigger>
          {uniqueCategories.map((category) => (
            <TabsTrigger
              key={category.id || category.name}
              value={category.name.toLowerCase()}
              className="rounded-full data-[state=active]:bg-white/60 data-[state=active]:shadow-md transition-all"
            >
              <div className="relative h-4 w-4 flex-shrink-0 mr-2">
                <Image
                  src={category.imageUrl || "/placeholder.svg?height=100&width=100"}
                  alt={category.name}
                  fill
                  className="object-cover"
                />
              </div>              
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory} className="space-y-6 border-t p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => onItemClick && onItemClick(item)}
                className="group flex glass-card overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:translate-y-[-5px] p-4 gap-4 cursor-pointer"
              >
                {/* Image */}
                <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-full border-2 border-white shadow-md">
                  <div className="absolute inset-0 bg-black/50 group-hover:bg-transparent transition-colors duration-300"></div>
                  <Image
                    src={
                      item.imageUrl || "/placeholder.svg?height=100&width=100"
                    }
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>
                {/* Content */}
                <div className="flex-1 p-4 relative">
                  {/* Item Name and Price */}
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start w-full mb-2">
                    <h3 className="font-medium group-hover:text-amber-500 transition-colors duration-300 mr-2">
                      {item.name}
                    </h3>
                    <p className="font-bold text-xl sm:text-2xl text-amber-500 mt-1 sm:mt-0">
                      {formatCurrency(Number(item.price), currency)}
                    </p>
                  </div>
                  {/* Category */}
                  <p className="text-sm text-gray-500 mb-2">
                    {item.categoryName}
                  </p>
                  {/* Description */}
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                    {item.description}
                  </p>
                  <div
                    className="mt-auto h-8 w-8 absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 px-2 rounded-full shadow-md hover:shadow-lg bg-primary flex items-center justify-center text-white"
                  >
                    <ShoppingCart className="h-4 w-4" />
                  </div>
                </div>
              </div>              
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
