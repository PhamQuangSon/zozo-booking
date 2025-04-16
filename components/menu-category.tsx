"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useCurrencyStore } from "@/store/currency-store"
import Image from "next/image"
import { MenuItem } from "@/components/menu-item"

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
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>              
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory} className="space-y-6 border-t p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          <MenuItem
            items={filteredItems}
            showAddToCart={true}
            onItemClick={onItemClick}
					/>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
