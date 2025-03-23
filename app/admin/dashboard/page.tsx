import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RecentOrders } from "@/components/recent-orders"
import { Overview } from "@/components/overview"
import { DashboardCards } from "@/components/dashboard-cards"
import prisma from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Store } from "lucide-react"

// Function to get dashboard data
async function getDashboardData() {
  // Get total revenue
  const totalRevenue = await prisma.order.aggregate({
    _sum: {
      total_amount: true
    },
    where: {
      status: {
        in: ["COMPLETED"],
      },
    },
  })

  // Get total orders
  const totalOrders = await prisma.order.count()

  // Get active tables
  const activeTables = await prisma.table.count({
    where: {
      status: "OCCUPIED",
    },
  })

  // Get popular items
  const popularItems = await prisma.orderItem.groupBy({
    by: ["menu_item_id"],
    _count: {
      id: true,
    },
    orderBy: {
      _count: {
        id: "desc",
      },
    },
    take: 1,
  })

  let popularItemName = "None"
  if (popularItems.length > 0) {
    const item = await prisma.menuItem.findUnique({
      where: { id: popularItems[0].menu_item_id },
    })
    if (item) {
      popularItemName = item.name
    }
  }

  return {
    revenue: totalRevenue._sum.total_amount?.toNumber() ?? 0,
    orders: totalOrders,
    activeTables,
    popularItem: popularItemName,
  }
}

// Get recent restaurants
async function getRecentRestaurants() {
  const restaurants = await prisma.restaurant.findMany({
    take: 3,
    orderBy: {
      createdAt: "desc",
    },
  })

  return restaurants
}

export default async function DashboardPage() {
  const dashboardData = await getDashboardData()
  const recentRestaurants = await getRecentRestaurants()

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
