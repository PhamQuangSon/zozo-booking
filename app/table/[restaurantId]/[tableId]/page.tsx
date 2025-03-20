"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MenuCategory } from "@/components/menu-category"
import { ShoppingCart, ChevronLeft } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { OrderCart } from "@/components/order-cart"

export default function TableOrderPage({
  params,
}: {
  params: { restaurantId: string; tableId: string }
}) {
  const [cartItems, setCartItems] = useState<any[]>([])

  // In a real app, you would fetch the restaurant data based on the ID
  const restaurant = {
    id: params.restaurantId,
    name: "Pasta Paradise",
    tableNumber: params.tableId,
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href={`/restaurants/${params.restaurantId}`}>
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back to Restaurant
          </Link>
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Table {restaurant.tableNumber}</CardTitle>
            <CardDescription>{restaurant.name} - Place your order directly from your table</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="menu">
              <TabsList className="mb-6">
                <TabsTrigger value="menu">Menu</TabsTrigger>
                <TabsTrigger value="current-order">Current Order</TabsTrigger>
              </TabsList>
              <TabsContent value="menu">
                <div className="space-y-8">
                  <MenuCategory
                    name="Appetizers"
                    items={[
                      {
                        id: "1",
                        name: "Bruschetta",
                        description: "Toasted bread topped with tomatoes, garlic, and basil",
                        price: 8.99,
                        image: "/placeholder.svg?height=100&width=100",
                      },
                      {
                        id: "2",
                        name: "Calamari",
                        description: "Fried squid served with marinara sauce",
                        price: 10.99,
                        image: "/placeholder.svg?height=100&width=100",
                      },
                      {
                        id: "3",
                        name: "Caprese Salad",
                        description: "Fresh mozzarella, tomatoes, and basil drizzled with balsamic glaze",
                        price: 9.99,
                        image: "/placeholder.svg?height=100&width=100",
                      },
                    ]}
                  />
                  <MenuCategory
                    name="Pasta"
                    items={[
                      {
                        id: "4",
                        name: "Spaghetti Carbonara",
                        description: "Spaghetti with pancetta, eggs, Parmesan, and black pepper",
                        price: 15.99,
                        image: "/placeholder.svg?height=100&width=100",
                      },
                      {
                        id: "5",
                        name: "Fettuccine Alfredo",
                        description: "Fettuccine pasta in a rich, creamy Parmesan sauce",
                        price: 14.99,
                        image: "/placeholder.svg?height=100&width=100",
                      },
                      {
                        id: "6",
                        name: "Lasagna",
                        description: "Layers of pasta, meat sauce, and cheese baked to perfection",
                        price: 16.99,
                        image: "/placeholder.svg?height=100&width=100",
                      },
                    ]}
                  />
                </div>
              </TabsContent>
              <TabsContent value="current-order">
                <OrderCart />
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="border-t bg-muted/50 p-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button className="w-full">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  View Order
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Your Order</SheetTitle>
                </SheetHeader>
                <OrderCart />
              </SheetContent>
            </Sheet>
          </CardFooter>
        </Card>
      </div>
    </main>
  )
}

