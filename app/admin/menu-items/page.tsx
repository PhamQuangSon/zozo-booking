import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search } from "lucide-react"
import { MenuItemsTable } from "@/components/admin/menu-items-table"
import prisma from "@/lib/prisma"
import { serializePrismaData } from "@/lib/prisma-helpers"

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
          <MenuItemsTable menuItems={serializedMenuItems} />
        </CardContent>
      </Card>
    </div>
  )
}

