"use client"

import { useState } from "react"
import { DataTable, type ColumnDef } from "@/components/admin/data-table"
import { deleteMenuItem } from "@/actions/menu-item-actions"
import { MenuItemEditModal } from "@/components/admin/menu-item-edit-modal"
import { useRouter } from "next/navigation"
import type { MenuItem, Restaurant } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { Input } from "@/components/ui/input"

// Extended MenuItem type with restaurant relation
type MenuItemWithRestaurant = MenuItem & {
  restaurant: {
    id: number
    name: string
  }
}

interface CategoriesClientProps {
  columns: ColumnDef<MenuItemWithRestaurant>[]
  initialCategories: MenuItemWithRestaurant[]
  restaurants: Restaurant[]
}

export function CategoriesClient({ columns, initialCategories, restaurants }: CategoriesClientProps) {
  const router = useRouter()
  const [categories, setCategories] = useState<MenuItemWithRestaurant[]>(initialCategories)
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItemWithRestaurant | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  // Filter categories based on search query
  const filteredCategories = categories.filter(
    (MenuItem) =>
      MenuItem.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      MenuItem.restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Handle edit button click
  const handleEdit = (MenuItem: MenuItemWithRestaurant) => {
    setSelectedMenuItem(MenuItem)
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
          Add MenuItem
        </Button>
      </div>

      <DataTable data={filteredCategories} columns={columns} deleteAction={deleteMenuItem} onEdit={handleEdit} />

      {/* Edit Modal */}
      {selectedMenuItem && (
        <MenuItemEditModal
          menuItem={selectedMenuItem}
          restaurants={restaurants}
          open={isEditModalOpen}
          onOpenChange={handleModalClose}
          mode="edit"
        />
      )}

      {/* Add Modal */}
      <MenuItemEditModal
        menuItem={null}
        restaurants={restaurants}
        open={isAddModalOpen}
        onOpenChange={handleModalClose}
        mode="create"
      />
    </>
  )
}

