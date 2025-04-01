"use client"

import { useState, useEffect } from "react"
import { DataTable, type ColumnDef } from "@/components/admin/data-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PlusCircle } from "lucide-react"
import { deleteMenuItem } from "@/actions/menu-item-actions"
import { MenuItemEditModal } from "@/components/admin/menu-item-edit-modal"
import Image from "next/image"
import { useRouter } from "next/navigation"

type MenuItemWithRelations = {
  id: number
  name: string
  description: string | null
  price: number
  formattedPrice: string // Pre-formatted on server
  categoryId: number
  restaurantId: number
  isAvailable: boolean
  displayOrder: number
  imageUrl: string | null
  category: { id: number; name: string } | null
  restaurant: { id: number; name: string } | null
  categoryName: string // Pre-formatted on server
  restaurantName: string // Pre-formatted on server
}

interface MenuItemsClientProps {
  menuItems: MenuItemWithRelations[]
}

export function MenuItemsClient({ menuItems = [] }: MenuItemsClientProps) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItemWithRelations | null>(null)
  const [categories, setCategories] = useState<any[]>([])
  const [restaurants, setRestaurants] = useState<any[]>([])

  // Fetch categories and restaurants on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get unique categories and restaurants from menu items
        const uniqueCategories = new Map()
        const uniqueRestaurants = new Map()

        menuItems.forEach((item) => {
          if (item.category) {
            uniqueCategories.set(item.category.id, item.category)
          }
          if (item.restaurant) {
            uniqueRestaurants.set(item.restaurant.id, item.restaurant)
          }
        })

        setCategories(Array.from(uniqueCategories.values()))
        setRestaurants(Array.from(uniqueRestaurants.values()))
      } catch (error) {
        console.error("Error fetching data:", error)
      }
    }

    fetchData()
  }, [menuItems])

  const filteredMenuItems = menuItems.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (item.categoryName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (item.restaurantName?.toLowerCase() || "").includes(searchTerm.toLowerCase()),
  )

  const columns: ColumnDef<MenuItemWithRelations>[] = [
    {
      id: "name",
      header: "Name",
      accessorKey: "name",
      sortable: true,
    },
    {
      id: "image",
      header: "Image",
      accessorKey: "imageUrl",
      cell: (value) =>
        value ? (
          <div className="relative w-12 h-12">
            <Image src={value || "/placeholder.svg"} alt="Menu item" fill className="object-cover rounded-md" />
          </div>
        ) : (
          <div className="text-gray-400">No image</div>
        ),
      sortable: false,
    },
    {
      id: "price",
      header: "Price",
      accessorKey: "formattedPrice", // Use pre-formatted price
      sortable: true,
    },
    {
      id: "category",
      header: "Category",
      accessorKey: "categoryName", // Use pre-formatted category name
      sortable: true,
    },
    {
      id: "restaurant",
      header: "Restaurant",
      accessorKey: "restaurantName", // Use pre-formatted restaurant name
      sortable: true,
    },
    {
      id: "available",
      header: "Available",
      accessorKey: "isAvailable",
      cell: (value) => (value ? "Yes" : "No"),
      sortable: true,
    },
  ]

  const handleAddMenuItem = () => {
    setSelectedMenuItem(null)
    setIsModalOpen(true)
  }

  const handleEditMenuItem = (menuItem: MenuItemWithRelations) => {
    setSelectedMenuItem(menuItem)
    setIsModalOpen(true)
  }

  // Handle modal close with refresh
  const handleModalClose = (refresh: boolean) => {
    setIsModalOpen(false)
    if (refresh) {
      router.refresh()
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Input
          placeholder="Search menu items..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Button onClick={handleAddMenuItem}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Menu Item
        </Button>
      </div>

      <DataTable data={filteredMenuItems} columns={columns} deleteAction={deleteMenuItem} onEdit={handleEditMenuItem} />

      <MenuItemEditModal
        open={isModalOpen}
        onOpenChange={handleModalClose}
        menuItem={selectedMenuItem}
        categories={categories}
        restaurants={restaurants}
        mode={selectedMenuItem ? "edit" : "create"}
      />
    </div>
  )
}

