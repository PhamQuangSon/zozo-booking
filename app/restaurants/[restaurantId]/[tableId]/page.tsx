import { Suspense } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MenuCategory } from "@/components/menu-category"
import { OrderCart } from "@/components/order-cart"
import { getMenuForTable, getTableDetails } from "@/actions/table-actions"
import { getRestaurantById } from "@/actions/restaurant-actions"
import { notFound } from "next/navigation"

// Loading component
function TableMenuLoading() {
  return (
    <div className="space-y-8">
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-4">
          <div className="h-8 w-48 rounded-md bg-muted animate-pulse"></div>
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2, 3, 4].map((j) => (
              <div key={j} className="h-24 rounded-lg bg-muted animate-pulse"></div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// Restaurant info component
async function RestaurantInfo({ restaurantId }: { restaurantId: string }) {
  const { success, data: restaurant, error } = await getRestaurantById(restaurantId)

  if (!success || !restaurant) {
    return <div className="text-center text-destructive">Error loading restaurant: {error}</div>
  }

  return (
    <div className="mb-6">
      <div className="relative mb-6 h-48 w-full overflow-hidden rounded-lg md:h-64">
        <Image
          src={restaurant.image_url || "/placeholder.svg?height=400&width=800"}
          alt={restaurant.name}
          fill
          className="object-cover"
        />
      </div>
      <h1 className="text-3xl font-bold">{restaurant.name}</h1>
      <p className="mt-2 text-muted-foreground">{restaurant.description}</p>
    </div>
  )
}

// Table menu component
async function TableMenu({ restaurantId, tableId }: { restaurantId: string; tableId: string }) {
  const { success, data, error } = await getMenuForTable(restaurantId, tableId)

  if (!success || !data) {
    return <div className="text-center text-destructive">Error loading menu: {error}</div>
  }

  const { table, menu } = data

  if (!menu.menu_categories || menu.menu_categories.length === 0) {
    return <div className="text-center text-muted-foreground">No menu items available</div>
  }

  return (
    <div className="space-y-8">
      {menu.menu_categories.map((category) => (
        <MenuCategory
          key={category.id}
          name={category.name}
          items={category.menu_items.map((item) => ({
            id: item.id.toString(),
            name: item.name,
            description: item.description || "",
            price: Number(item.price),
            image: item.image_url || "/placeholder.svg?height=100&width=100",
            options: item.menu_item_options,
          }))}
        />
      ))}
    </div>
  )
}

export default async function TableOrderPage({ params }: { params: { restaurantId: string; tableId: string } }) {
  // Get table details
  const tableResult = await getTableDetails(params.tableId)

  if (!tableResult.success) {
    notFound()
  }

  const table = tableResult.data

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href={`/restaurants/${params.restaurantId}`}>
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back to Restaurant
          </Link>
        </Button>

        <Suspense fallback={<div className="h-48 w-full rounded-lg bg-muted animate-pulse"></div>}>
          <RestaurantInfo restaurantId={params.restaurantId} />
        </Suspense>

        <Card>
          <CardHeader>
            <CardTitle>Table {table.number}</CardTitle>
            <CardDescription>Place your order directly from your table</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="menu">
              <TabsList className="mb-6">
                <TabsTrigger value="menu">Menu</TabsTrigger>
                <TabsTrigger value="current-order">Current Order</TabsTrigger>
              </TabsList>
              <TabsContent value="menu">
                <Suspense fallback={<TableMenuLoading />}>
                  <TableMenu restaurantId={params.restaurantId} tableId={params.tableId} />
                </Suspense>
              </TabsContent>
              <TabsContent value="current-order">
                <OrderCart restaurantId={params.restaurantId} tableId={params.tableId} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

