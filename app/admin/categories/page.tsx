import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search } from 'lucide-react'
import { CategoryTable } from "@/components/admin/category-table"
import prisma from "@/lib/prisma"
import { serializePrismaData } from "@/lib/prisma-helpers"

export default async function CategoriesPage() {
  // Fetch all categories with their associated menu and restaurant
  const categories = await prisma.menuCategory.findMany({
    include: {
      menu: {
        include: {
          restaurant: true,
        },
      },
    },
    orderBy: {
      menu: {
        restaurant: {
          name: "asc",
        },
      },
    },
  })

  // Serialize the data to handle Decimal values
  const serializedCategories = serializePrismaData(categories)

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
          <CardDescription>
            Manage menu categories across all restaurants
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CategoryTable categories={serializedCategories} />
        </CardContent>
      </Card>
    </div>
  )
}
