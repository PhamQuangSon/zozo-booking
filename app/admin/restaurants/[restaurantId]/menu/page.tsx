import { notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getRestaurantById } from "@/actions/restaurant-actions"
import { Button } from "@/components/ui/button"
import { Plus, Edit, Trash2 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function RestaurantMenuPage({ params }: { params: { restaurantId: string } }) {
  // Fetch restaurant details
  const { success, data: restaurant, error } = await getRestaurantById(params.restaurantId)

  if (!success || !restaurant) {
    notFound()
  }

  return (
    <div className="flex min-h-screen">
      <div className="flex-1 p-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Menu Management</h1>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Menu
          </Button>
        </div>

        <Tabs defaultValue="menus">
          <TabsList className="mb-4">
            <TabsTrigger value="menus">Menus</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="items">Menu Items</TabsTrigger>
          </TabsList>

          <TabsContent value="menus">
            <Card>
              <CardHeader>
                <CardTitle>Menus</CardTitle>
                <CardDescription>Manage your restaurant menus</CardDescription>
              </CardHeader>
              <CardContent>
                {restaurant.menus && restaurant.menus.length > 0 ? (
                  <div className="space-y-4">
                    {restaurant.menus.map((menu) => (
                      <div key={menu.id} className="flex items-center justify-between rounded-md border p-4">
                        <div>
                          <h3 className="font-medium">{menu.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {menu.is_active ? "Active" : "Inactive"} •{menu.menu_categories?.length || 0} categories
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
                    <p className="mb-4 text-muted-foreground">No menus found</p>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Create First Menu
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories">
            <Card>
              <CardHeader>
                <CardTitle>Menu Categories</CardTitle>
                <CardDescription>Organize your menu with categories</CardDescription>
              </CardHeader>
              <CardContent>
                {restaurant.menus && restaurant.menus.length > 0 ? (
                  <div className="space-y-4">
                    {restaurant.menus.flatMap(
                      (menu) =>
                        menu.menu_categories?.map((category) => (
                          <div key={category.id} className="flex items-center justify-between rounded-md border p-4">
                            <div>
                              <h3 className="font-medium">{category.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                Menu: {menu.name} •{category.menu_items?.length || 0} items
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
                        )) || [],
                    )}
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
          </TabsContent>

          <TabsContent value="items">
            <Card>
              <CardHeader>
                <CardTitle>Menu Items</CardTitle>
                <CardDescription>Manage your menu items</CardDescription>
              </CardHeader>
              <CardContent>
                {restaurant.menus && restaurant.menus.length > 0 ? (
                  <div className="space-y-4">
                    {restaurant.menus.flatMap(
                      (menu) =>
                        menu.menu_categories?.flatMap(
                          (category) =>
                            category.menu_items?.map((item) => (
                              <div key={item.id} className="flex items-center justify-between rounded-md border p-4">
                                <div className="flex items-center gap-4">
                                  <div className="relative h-12 w-12 overflow-hidden rounded-md">
                                    <img
                                      src={item.image_url || "/placeholder.svg?height=48&width=48"}
                                      alt={item.name}
                                      className="h-full w-full object-cover"
                                    />
                                  </div>
                                  <div>
                                    <h3 className="font-medium">{item.name}</h3>
                                    <p className="text-sm text-muted-foreground">
                                      {category.name} • ${Number(item.price).toFixed(2)}
                                    </p>
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
                            )) || [],
                        ) || [],
                    )}
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

