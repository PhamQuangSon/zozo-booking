import { notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getRestaurantById } from "@/actions/restaurant-actions"
import { getRestaurantTables } from "@/actions/table-actions"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Edit, Plus } from "lucide-react"

export default async function RestaurantDetailPage({ params }: { params: { restaurantId: string } }) {
  // Fetch restaurant details
  const { success, data: restaurant, error } = await getRestaurantById(params.restaurantId)

  if (!success || !restaurant) {
    notFound()
  }

  // Fetch tables for this restaurant
  const tablesResult = await getRestaurantTables(params.restaurantId)
  const tables = tablesResult.success ? tablesResult.data : []

  return (
    <div className="flex min-h-screen">
      <div className="flex-1 p-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">{restaurant.name}</h1>
          <Button asChild>
            <Link href={`/admin/restaurants/${params.restaurantId}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Restaurant
            </Link>
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Restaurant Details</CardTitle>
              <CardDescription>Basic information about the restaurant</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex justify-center">
                {restaurant.image_url ? (
                  <div className="relative h-48 w-full overflow-hidden rounded-md">
                    <Image
                      src={restaurant.image_url || "/placeholder.svg"}
                      alt={restaurant.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex h-48 w-full items-center justify-center rounded-md bg-muted">
                    <p className="text-muted-foreground">No image available</p>
                  </div>
                )}
              </div>

              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Cuisine</dt>
                  <dd>{restaurant.cuisine || "Not specified"}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Address</dt>
                  <dd>{restaurant.address || "Not specified"}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Phone</dt>
                  <dd>{restaurant.phone || "Not specified"}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Email</dt>
                  <dd>{restaurant.email || "Not specified"}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Tables</CardTitle>
                <CardDescription>Tables in this restaurant</CardDescription>
              </div>
              <Button asChild size="sm">
                <Link href={`/admin/restaurants/${params.restaurantId}/tables`}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Table
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {tables.length === 0 ? (
                <p className="text-center text-muted-foreground">No tables added yet</p>
              ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {tables.slice(0, 6).map((table) => (
                    <div key={table.id} className="rounded-md border p-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Table {table.number}</span>
                        <span
                          className={`text-xs ${
                            table.status === "AVAILABLE"
                              ? "text-green-500"
                              : table.status === "OCCUPIED"
                                ? "text-red-500"
                                : table.status === "RESERVED"
                                  ? "text-amber-500"
                                  : "text-gray-500"
                          }`}
                        >
                          {table.status}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">Capacity: {table.capacity}</p>
                    </div>
                  ))}
                  {tables.length > 6 && (
                    <Link
                      href={`/admin/restaurants/${params.restaurantId}/tables`}
                      className="flex items-center justify-center rounded-md border p-3 text-sm text-muted-foreground hover:bg-accent"
                    >
                      View all {tables.length} tables
                    </Link>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Menu</CardTitle>
                <CardDescription>Menu items for this restaurant</CardDescription>
              </div>
              <Button asChild size="sm">
                <Link href={`/admin/restaurants/${params.restaurantId}/menu`}>
                  <Plus className="mr-2 h-4 w-4" />
                  Manage Menu
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {restaurant.menus && restaurant.menus.length > 0 ? (
                <div>
                  {restaurant.menus.map((menu) => (
                    <div key={menu.id}>
                      <h3 className="mb-2 font-medium">{menu.name}</h3>
                      {menu.menu_categories && menu.menu_categories.length > 0 ? (
                        <div className="space-y-4">
                          {menu.menu_categories.map((category) => (
                            <div key={category.id}>
                              <h4 className="text-sm font-medium text-muted-foreground">{category.name}</h4>
                              <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
                                {category.menu_items.slice(0, 3).map((item) => (
                                  <div key={item.id} className="rounded-md border p-2">
                                    <div className="font-medium">{item.name}</div>
                                    <div className="text-sm text-muted-foreground">
                                      ${Number(item.price).toFixed(2)}
                                    </div>
                                  </div>
                                ))}
                                {category.menu_items.length > 3 && (
                                  <div className="rounded-md border p-2 text-center text-sm text-muted-foreground">
                                    +{category.menu_items.length - 3} more items
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No categories in this menu</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground">No menus added yet</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

