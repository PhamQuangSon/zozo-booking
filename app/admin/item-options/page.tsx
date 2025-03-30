import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search } from "lucide-react"
import { DataTable, type ColumnDef } from "@/components/data-table"
import prisma from "@/lib/prisma"
import { serializePrismaData } from "@/lib/prisma-helpers"
import { deleteItemOption } from "@/actions/admin-actions"

interface OptionChoice {
  id: number
  name: string
  price_adjustment: number
}

interface ItemOption {
  id: number
  name: string
  price_adjustment: number
  is_required: boolean
  menu_item: {
    id: number
    name: string
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
  }
  option_choices: OptionChoice[]
}

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

  // Define columns for the DataTable
  const columns: ColumnDef<ItemOption>[] = [
    {
      id: "name",
      header: "Option Name",
      accessorKey: "name",
      sortable: true,
    },
    {
      id: "menuItem",
      header: "Menu Item",
      accessorKey: "menu_item.name",
      sortable: true,
    },
    {
      id: "restaurant",
      header: "Restaurant",
      accessorKey: "menu_item.menu_categories.menu.restaurant.name",
      sortable: true,
    },
    {
      id: "required",
      header: "Required",
      accessorKey: "is_required",
      cell: (value) => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            value ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"
          }`}
        >
          {value ? "Required" : "Optional"}
        </span>
      ),
      sortable: true,
    },
    {
      id: "choices",
      header: "Choices",
      accessorKey: (row) => row.option_choices.length,
      sortable: true,
    },
  ]

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
          <DataTable
            data={serializedItemOptions}
            columns={columns}
            deleteAction={deleteItemOption}
            editPath="/admin/item-options/edit/"
          />
        </CardContent>
      </Card>
    </div>
  )
}

