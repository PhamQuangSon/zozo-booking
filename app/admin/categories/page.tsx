import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search } from "lucide-react"
import type { ColumnDef } from "@/components/admin/data-table"
import { getCategories } from "@/actions/category-actions"
import { getRestaurants } from "@/actions/restaurant-actions"
import { CategoriesClient } from "@/components/admin/categories-client"
import type { Category } from "@prisma/client"

export default async function CategoriesPage() {
  // Fetch data using server actions
  const categoriesResult = await getCategories()
  const restaurantsResult = await getRestaurants()

  const categories = categoriesResult.success ? categoriesResult.data : []
  const restaurants = restaurantsResult.success ? restaurantsResult.data : []

  // Define columns for the DataTable
  const columns: ColumnDef<Category & { restaurant: { name: string } }>[] = [
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
      id: "displayOrder",
      header: "Display Order",
      accessorKey: "displayOrder",
      sortable: true,
    },
  ]

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Categories</h2>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search categories..." className="pl-8" />
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Categories</CardTitle>
          <CardDescription>Manage menu categories across all restaurants</CardDescription>
        </CardHeader>
        <CardContent>
          <CategoriesClient columns={columns} initialCategories={categories} restaurants={restaurants} />
        </CardContent>
      </Card>
    </div>
  )
}

