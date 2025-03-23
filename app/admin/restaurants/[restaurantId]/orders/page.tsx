import { notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getRestaurantById } from "@/actions/restaurant-actions"
import { Button } from "@/components/ui/button"
import { Eye, Filter } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function ViewOrdersPage({ params }: { params: { restaurantId: string } }) {
  // Fetch restaurant details
  const { success, data: restaurant, error } = await getRestaurantById(params.restaurantId)

  if (!success || !restaurant) {
    notFound()
  }

  // Mock orders data
  const orders = [
    {
      id: "ORD-001",
      tableNumber: 3,
      status: "PENDING",
      items: 4,
      total: 45.99,
      createdAt: new Date().toISOString(),
    },
    {
      id: "ORD-002",
      tableNumber: 1,
      status: "COMPLETED",
      items: 2,
      total: 23.5,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: "ORD-003",
      tableNumber: 5,
      status: "IN_PROGRESS",
      items: 6,
      total: 78.25,
      createdAt: new Date(Date.now() - 7200000).toISOString(),
    },
  ]

  return (
    <div className="flex min-h-screen">
      <div className="flex-1 p-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">View Orders - {restaurant.name}</h1>
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
        </div>

        <Tabs defaultValue="all">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Orders</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="in-progress">In Progress</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <Card>
              <CardHeader>
                <CardTitle>All Orders</CardTitle>
                <CardDescription>View and manage all orders for {restaurant.name}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between rounded-md border p-4">
                      <div>
                        <h3 className="font-medium">{order.id}</h3>
                        <p className="text-sm text-muted-foreground">
                          Table {order.tableNumber} • {new Date(order.createdAt).toLocaleString()}
                        </p>
                        <p className="text-sm">
                          <span
                            className={`font-medium ${
                              order.status === "PENDING"
                                ? "text-yellow-500"
                                : order.status === "IN_PROGRESS"
                                  ? "text-blue-500"
                                  : "text-green-500"
                            }`}
                          >
                            {order.status.replace("_", " ")}
                          </span>
                          {" • "}
                          {order.items} items • ${order.total.toFixed(2)}
                        </p>
                      </div>
                      <Button size="sm" variant="outline">
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle>Pending Orders</CardTitle>
                <CardDescription>Orders waiting to be processed</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orders
                    .filter((order) => order.status === "PENDING")
                    .map((order) => (
                      <div key={order.id} className="flex items-center justify-between rounded-md border p-4">
                        <div>
                          <h3 className="font-medium">{order.id}</h3>
                          <p className="text-sm text-muted-foreground">
                            Table {order.tableNumber} • {new Date(order.createdAt).toLocaleString()}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium text-yellow-500">PENDING</span>
                            {" • "}
                            {order.items} items • ${order.total.toFixed(2)}
                          </p>
                        </div>
                        <Button size="sm" variant="outline">
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </Button>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="in-progress">
            <Card>
              <CardHeader>
                <CardTitle>In Progress Orders</CardTitle>
                <CardDescription>Orders currently being prepared</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orders
                    .filter((order) => order.status === "IN_PROGRESS")
                    .map((order) => (
                      <div key={order.id} className="flex items-center justify-between rounded-md border p-4">
                        <div>
                          <h3 className="font-medium">{order.id}</h3>
                          <p className="text-sm text-muted-foreground">
                            Table {order.tableNumber} • {new Date(order.createdAt).toLocaleString()}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium text-blue-500">IN PROGRESS</span>
                            {" • "}
                            {order.items} items • ${order.total.toFixed(2)}
                          </p>
                        </div>
                        <Button size="sm" variant="outline">
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </Button>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="completed">
            <Card>
              <CardHeader>
                <CardTitle>Completed Orders</CardTitle>
                <CardDescription>Orders that have been fulfilled</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orders
                    .filter((order) => order.status === "COMPLETED")
                    .map((order) => (
                      <div key={order.id} className="flex items-center justify-between rounded-md border p-4">
                        <div>
                          <h3 className="font-medium">{order.id}</h3>
                          <p className="text-sm text-muted-foreground">
                            Table {order.tableNumber} • {new Date(order.createdAt).toLocaleString()}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium text-green-500">COMPLETED</span>
                            {" • "}
                            {order.items} items • ${order.total.toFixed(2)}
                          </p>
                        </div>
                        <Button size="sm" variant="outline">
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </Button>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

