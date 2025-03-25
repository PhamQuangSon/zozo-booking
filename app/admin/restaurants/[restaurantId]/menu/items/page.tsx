import { notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getRestaurantById } from "@/actions/restaurant-actions"
import { Button } from "@/components/ui/button"
import { Plus, Edit, Trash2, Search } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"

export default async function MenuItemsPage({ params }: { params: { restaurantId: string } }) {
  // Fetch restaurant details
  const { success, data: restaurant, error } = await getRestaurantById(params.restaurantId)

  if (!success || !restaurant) {
    notFound()
  }

  // Extract all menu items from all categories and menus
  const allMenuItems = restaurant.menus.flatMap(
    (menu) =>
      menu.menu_categories?.flatMap(
        (category) =>
          category.menu_items?.map((item) => ({
            ...item,
            categoryName: category.name,
            categoryId: category.id,
            menuName: menu.name,
            menuId: menu.id,
          })) || [],
      ) || [],
  )

  return (
    <div className="flex min-h-screen">
      <div className="flex-1 p-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Menu Items</h1>
            <p className="text-muted-foreground">Manage food and beverage items for your restaurant</p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Menu Item
          </Button>
        </div>

        <div className="mb-6 flex w-full max-w-sm items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search menu items..." className="pl-8" />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Menu Items</CardTitle>
            <CardDescription>Items available on your restaurant menus</CardDescription>
          </CardHeader>
          <CardContent>
            {allMenuItems.length > 0 ? (
              <div className="space-y-4">
                {allMenuItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-md border p-4">
                    <div className="flex items-center gap-4">
                      <div className="relative h-16 w-16 overflow-hidden rounded-md">
                        <img
                          src={item.image_url || "/placeholder.svg?height=64&width=64"}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {item.menuName} • {item.categoryName} • ${Number(item.price).toFixed(2)}
                        </p>
                        {item.description && (
                          <p className="mt-1 text-xs text-muted-foreground line-clamp-1">{item.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                      <Button size="sm" variant="destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <p className="mb-4 text-muted-foreground">No menu items found</p>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Menu Item
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-8">
          <h2 className="mb-4 text-xl font-semibold">Menu Item Creation Flow</h2>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    1
                  </div>
                  <div>
                    <h3 className="font-medium">Select a Menu</h3>
                    <p className="text-sm text-muted-foreground">Choose which menu the item will appear on</p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    2
                  </div>
                  <div>
                    <h3 className="font-medium">Select a Category</h3>
                    <p className="text-sm text-muted-foreground">Choose which category the item belongs to</p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    3
                  </div>
                  <div>
                    <h3 className="font-medium">Add Item Details</h3>
                    <p className="text-sm text-muted-foreground">Enter name, description, price, and upload an image</p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    4
                  </div>
                  <div>
                    <h3 className="font-medium">Add Options & Modifiers (Optional)</h3>
                    <p className="text-sm text-muted-foreground">
                      Configure customization options like sizes, toppings, etc.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

