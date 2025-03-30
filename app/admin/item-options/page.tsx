import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search } from "lucide-react"
import { ItemOptionsTable } from "@/components/admin/item-options-table"
import prisma from "@/lib/prisma"
import { serializePrismaData } from "@/lib/prisma-helpers"

export default async function ItemOptionsPage() {
  // Fetch all menu item options with their associated menu item
  const itemOptions = await prisma.menuItemOption.findMany({
    include: {
      menu_item: {
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
      },
      option_choices: true,
    },
    orderBy: {
      menu_item: {
        name: "asc",
      },
    },
  })

  // Serialize the data to handle Decimal values
  const serializedItemOptions = serializePrismaData(itemOptions)

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Item Options</h2>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Item Option
        </Button>
      </div>
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search item options..." className="pl-8" />
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Item Options</CardTitle>
          <CardDescription>Manage menu item options across all restaurants</CardDescription>
        </CardHeader>
        <CardContent>
          <ItemOptionsTable itemOptions={serializedItemOptions} />
        </CardContent>
      </Card>
    </div>
  )
}

