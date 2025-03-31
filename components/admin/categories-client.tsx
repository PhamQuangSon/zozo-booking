"use client"

import { useState } from "react"
import { DataTable, type ColumnDef } from "@/components/admin/data-table"
import { deleteCategory } from "@/actions/category-actions"
import { CategoryEditModal } from "@/components/admin/category-edit-modal"
import { useRouter } from "next/navigation"
import type { Category, Restaurant } from "@prisma/client"

// Extended Category type with restaurant relation
type CategoryWithRestaurant = Category & {
  restaurant: {
    id: number
    name: string
  }
}

interface CategoriesClientProps {
  columns: ColumnDef<CategoryWithRestaurant>[]
  initialCategories: CategoryWithRestaurant[]
  restaurants: Restaurant[]
}

export function CategoriesClient({ columns, initialCategories, restaurants }: CategoriesClientProps) {
  const router = useRouter()
  const [categories, setCategories] = useState<CategoryWithRestaurant[]>(initialCategories)
  const [selectedCategory, setSelectedCategory] = useState<CategoryWithRestaurant | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  // Filter categories based on search query
  const filteredCategories = categories.filter(
    (category) =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Handle edit button click
  const handleEdit = (category: CategoryWithRestaurant) => {
    setSelectedCategory(category)
    setIsEditModalOpen(true)
  }

  // Handle modal close with refresh
  const handleModalClose = (refresh: boolean) => {
    setIsEditModalOpen(false)
    if (refresh) {
      router.refresh()
    }
  }

  return (
    <>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search categories..."
          className="w-full p-2 border rounded"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <DataTable data={filteredCategories} columns={columns} deleteAction={deleteCategory} onEdit={handleEdit} />

      {/* Edit Modal */}
      {selectedCategory && (
        <CategoryEditModal
          category={selectedCategory}
          restaurants={restaurants}
          open={isEditModalOpen}
          onOpenChange={handleModalClose}
        />
      )}
    </>
  )
}

