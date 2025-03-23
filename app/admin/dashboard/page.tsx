import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RecentOrders } from "@/components/recent-orders"
import { Overview } from "@/components/overview"
import { DashboardCards } from "@/components/dashboard-cards"
import prisma from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Store } from "lucide-react"

// Define the type for dashboard data
type DashboardData = {
  revenue: number
  orders: number
  activeTables: number
  popularItem: string
}

type Restaurant = {
  id: number
  name: string
  description: string
  image_url: string
}

// Mock data for fallback
const mockRestaurants = [
  {
    id: 1,
    name: "Pasta Paradise",
    description: "Authentic Italian pasta dishes",
    image_url: "/placeholder.svg?height=100&width=100",
  },
  {
    id: 2,
    name: "Burger Bistro",
    description: "Gourmet burgers and sides",
    image_url: "/placeholder.svg?height=100&width=100",
  },
  {
    id: 3,
    name: "Sushi Sensation",
    description: "Fresh and creative sushi rolls",
    image_url: "/placeholder.svg?height=100&width=100",
  },
]

export default async function DashboardPage() {
  // Use try/catch to handle any errors during data fetching
  let dashboardData: DashboardData = {
    revenue: 0,
    orders: 0,
    activeTables: 0,
    popularItem: "None",
  }
  let recentRestaurants: Restaurant[] = mockRestaurants;

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <DashboardCards
            revenue={dashboardData.revenue}
            orders={dashboardData.orders}
            activeTables={dashboardData.activeTables}
            popularItem={dashboardData.popularItem}
          />

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Overview</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <Overview />
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>You have received 12 orders today</CardDescription>
              </CardHeader>
              <CardContent>
                <RecentOrders />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Your Restaurants</CardTitle>
              <CardDescription>Quick access to your restaurants</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {recentRestaurants.map((restaurant) => (
                  <Card key={restaurant.id}>
                    <CardContent className="p-4">
                      <div className="flex flex-col items-center gap-2 text-center">
                        <Store className="h-8 w-8 text-primary" />
                        <h3 className="font-semibold">{restaurant.name}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {restaurant.description || "No description available"}
                        </p>
                        <Button asChild className="mt-2 w-full">
                          <Link href={`/admin/restaurants/${restaurant.id}`}>Manage</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analytics</CardTitle>
              <CardDescription>Detailed analytics will be displayed here</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px] flex items-center justify-center">
              <p className="text-muted-foreground">Analytics dashboard coming soon</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
