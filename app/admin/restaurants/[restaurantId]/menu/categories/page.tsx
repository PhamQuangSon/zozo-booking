import { notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getRestaurantById } from "@/actions/restaurant-actions"
import { Button } from "@/components/ui/button"
import { Plus, Edit, Trash2 } from "lucide-react"
import { Separator } from "@/components/ui/separator"

export default async function MenuCategoriesPage({ params }: { params: { restaurantId: string } }) {
  // Fetch restaurant details
  const { success, data: restaurant, error } = await getRestaurantById(params.restaurantId)

  if (!success || !restaurant) {
    notFound()
  }

  // Extract all categories from all menus
  const allCategories = restaurant.menus.flatMap(
    (menu) =>
      menu.menu_categories?.map((category) => ({
        ...category,
        menuName: menu.name,
        menuId: menu.id,
      })) || [],
  )

  return (
    <div className="flex min-h-screen">
      <div className="flex-1 p-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Menu Categories</h1>
            <p className="text-muted-foreground">Manage categories for your restaurant menus</p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Categories</CardTitle>
            <CardDescription>Categories help organize your menu items</CardDescription>
          </CardHeader>
          <CardContent>
            {allCategories.length > 0 ? (
              <div className="space-y-4">
                {allCategories.map((category) => (
                  <div key={category.id} className="flex items-center justify-between rounded-md border p-4">
                    <div>
                      <h3 className="font-medium">{category.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Menu: {category.menuName} •{category.menu_items?.length || 0} items
                      </p>
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
                <p className="mb-4 text-muted-foreground">No categories found</p>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Category
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-8">
          <h2 className="mb-4 text-xl font-semibold">Category Management Flow</h2>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    1
                  </div>
                  <div>
                    <h3 className="font-medium">Select a Menu</h3>
                    <p className="text-sm text-muted-foreground">
                      First, choose which menu the category will belong to
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    2
                  </div>
                  <div>
                    <h3 className="font-medium">Create a Category</h3>
                    <p className="text-sm text-muted-foreground">
                      Add details like name, description, and display order
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    3
                  </div>
                  <div>
                    <h3 className="font-medium">Add Menu Items</h3>
                    <p className="text-sm text-muted-foreground">
                      Once the category is created, you can add menu items to it
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

