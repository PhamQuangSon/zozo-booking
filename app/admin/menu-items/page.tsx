import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search } from "lucide-react"
import { DataTable, type ColumnDef } from "@/components/admin/data-table"
import prisma from "@/lib/prisma"
import { serializePrismaData } from "@/lib/prisma-helpers"
import { formatCurrency } from "@/lib/i18n"
import { deleteMenuItem } from "@/actions/admin-actions"

interface MenuItem {
  id: number
  name: string
  description: string | null
  price: number
  is_available: boolean
  menu_categories: {
    name: string
    menu: {
      name: string
      restaurant: {
        id: number
        name: string
      }
    }
  }
  display_order: number
}

export default async function MenuItemsPage() {
  // Fetch all menu items with their associated category, menu, and restaurant
  const menuItems = await prisma.menuItem.findMany({
    include: {
      menu_categories: {
        include: {
          menu: {
            include: {
              restaurant: true,
            },
          },
        },
      },
    },
    orderBy: {
      menu_categories: {
        menu: {
          restaurant: {
            name: "asc",
          },
        },
      },
    },
  })

  // Serialize the data to handle Decimal values
  const serializedMenuItems = serializePrismaData(menuItems)

  // Define columns for the DataTable
  const columns: ColumnDef<MenuItem>[] = [
    {
      id: "name",
      header: "Name",
      accessorKey: "name",
      sortable: true,
    },
    {
      id: "restaurant",
      header: "Restaurant",
      accessorKey: "menu_categories.menu.restaurant.name",
      sortable: true,
    },
    {
      id: "category",
      header: "Category",
      accessorKey: "menu_categories.name",
      sortable: true,
    },
    {
      id: "price",
      header: "Price",
      accessorKey: "price",
      cell: (value) => formatCurrency(value, "USD"),
      sortable: true,
    },
    {
      id: "available",
      header: "Available",
      accessorKey: "is_available",
      cell: (value) => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            value ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          {value ? "Yes" : "No"}
        </span>
      ),
      sortable: true,
    },
  ]

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Menu Items</h2>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Menu Item
        </Button>
      </div>
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search menu items..." className="pl-8" />
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Menu Items</CardTitle>
          <CardDescription>Manage menu items across all restaurants</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={serializedMenuItems}
            columns={columns}
            deleteAction={deleteMenuItem}
            editPath="/admin/menu-items/edit/"
          />
        </CardContent>
      </Card>
    </div>
  )
}

