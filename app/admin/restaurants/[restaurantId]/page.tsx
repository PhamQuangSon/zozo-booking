import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Edit, Plus } from "lucide-react";

import { MenuItem } from "@/components/menu-item";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getCachedRestaurantById } from "@/lib/restaurant-cache";
import type { PageProps } from "@/types/page-props";
import { tableStatusColors } from "@/types/status-colors";

export default async function RestaurantDetailPage({ params }: PageProps) {
  const { restaurantId } = params;
  // Fetch restaurant details
  const { success, data: restaurant } =
    await getCachedRestaurantById(restaurantId);

  if (!success || !restaurant) {
    notFound();
  }

  const tables = restaurant.tables ? restaurant.tables : [];

  return (
    <div className="flex min-h-screen">
      <div className="flex-1 p-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">{restaurant.name}</h1>
          <Button asChild>
            <Link href={`/admin/restaurants/${restaurantId}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Restaurant
            </Link>
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Restaurant Details</CardTitle>
              <CardDescription>
                Basic information about the restaurant
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex justify-center">
                {restaurant.imageUrl ? (
                  <div className="relative h-48 w-full overflow-hidden rounded-md">
                    <Image
                      src={restaurant.imageUrl || "/placeholder.svg"}
                      alt={restaurant.name}
                      fill
                      priority
                      sizes="(max-width: 768px) 100vw, 50vw"
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
                  <dt className="text-sm font-medium text-muted-foreground">
                    Cuisine
                  </dt>
                  <dd>{restaurant.cuisine || "Not specified"}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">
                    Address
                  </dt>
                  <dd>{restaurant.address || "Not specified"}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">
                    Phone
                  </dt>
                  <dd>{restaurant.phone || "Not specified"}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">
                    Email
                  </dt>
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
                <Link href={`/admin/restaurants/${restaurantId}/tables`}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Table
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {tables.length === 0 ? (
                <p className="text-center text-muted-foreground">
                  No tables added yet
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {tables.slice(0, 6).map((table) => (
                    <div key={table.id} className="rounded-md border p-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">
                          Table {table.number}
                        </span>
                        <Badge
                          className={
                            tableStatusColors[table.status] || "bg-gray-500"
                          }
                        >
                          {table.status.charAt(0) +
                            table.status.slice(1).toLowerCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Capacity: {table.capacity}
                      </p>
                    </div>
                  ))}
                  {tables.length > 6 && (
                    <Link
                      href={`/admin/restaurants/${restaurantId}/tables`}
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
                <CardDescription>
                  Menu items for this restaurant
                </CardDescription>
              </div>
              <Button asChild size="sm">
                <Link href={`/admin/restaurants/${restaurantId}/menu`}>
                  <Plus className="mr-2 h-4 w-4" />
                  Manage Menu
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div>
                {restaurant.categories && restaurant.categories.length > 0 ? (
                  <div className="space-y-4">
                    {restaurant.categories.map((category) => (
                      <div key={category.id}>
                        <h3 className="text-sm font-medium text-muted-foreground">
                          {category.name}
                        </h3>
                        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
                          <MenuItem
                            items={category.items.slice(0, 3)}
                            showAddToCart={false}
                          />
                          {category.items.length > 3 && (
                            <div className="rounded-md border p-2 text-center text-sm text-muted-foreground">
                              {category.items.length - 3} more items
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No categories in this menu
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
