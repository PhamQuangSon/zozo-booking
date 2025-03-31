"use client"

import { useState } from "react"
import { DataTable, type ColumnDef } from "@/components/admin/data-table"
import { deleteCategory } from "@/actions/category-actions"
import { CategoryEditModal } from "@/components/admin/category-edit-modal"
import { useRouter } from "next/navigation"
import type { Category, Restaurant } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { Input } from "@/components/ui/input"

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
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
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

  // Handle add button click
  const handleAdd = () => {
    setIsAddModalOpen(true)
  }

  // Handle modal close with refresh
  const handleModalClose = (refresh: boolean) => {
    setIsEditModalOpen(false)
    setIsAddModalOpen(false)

    if (refresh) {
      router.refresh()
    }
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="relative flex-1 max-w-sm">
          <Input
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-3"
          />
        </div>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      <DataTable data={filteredCategories} columns={columns} deleteAction={deleteCategory} onEdit={handleEdit} />

      {/* Edit Modal */}
      {selectedCategory && (
        <CategoryEditModal
          category={selectedCategory}
          restaurants={restaurants}
          open={isEditModalOpen}
          onOpenChange={handleModalClose}
          mode="edit"
        />
      )}

      {/* Add Modal */}
      <CategoryEditModal
        category={null}
        restaurants={restaurants}
        open={isAddModalOpen}
        onOpenChange={handleModalClose}
        mode="create"
      />
    </>
  )
}

