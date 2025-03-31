import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search } from "lucide-react"
import { DataTable, type ColumnDef } from "@/components/admin/data-table"
import prisma from "@/lib/prisma"
import { serializePrismaData } from "@/lib/prisma-helpers"
import { formatCurrency } from "@/lib/i18n"
import { deleteMenuItem } from "@/actions/admin-actions"
import { getMenuItems } from "@/actions/menu-item-actions"
import { MenuItem } from "@prisma/client"
import { useCurrencyStore } from "@/store/currencyStore"

export default async function MenuItemsPage() {
  const { currency } = useCurrencyStore()
  // Fetch all menu items with their associated category, menu, and restaurant
  const menuItems = await getMenuItems()

  // Serialize the data to handle Decimal values
  const serializedMenuItems = serializePrismaData(menuItems)

  // Define columns for the DataTable
  const columns: ColumnDef<MenuItem & { restaurant: { name: string } }>[] = [
    {
      id: "name",
      header: "Name",
      accessorKey: "name",
      sortable: true,
    },
    {
      id: "restaurant",
      header: "Restaurant",
      accessorKey: "restaurant.name",
      sortable: true,
    },
    {
      id: "category",
      header: "Category",
      accessorKey: "categories.name",
      sortable: true,
    },
    {
      id: "price",
      header: "Price",
      accessorKey: "price",
      cell: (value) => formatCurrency(value, currency),
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
    <Card>
      <CardHeader>
        <CardTitle>All Menu Items</CardTitle>
        <CardDescription>Manage menu items across all restaurants</CardDescription>
      </CardHeader>
      <CardContent>
        <CategoriesClient columns={columns} initialCategories={serializedMenuItems} restaurants={restaurants} />
      </CardContent>
    </Card>
  )
}

