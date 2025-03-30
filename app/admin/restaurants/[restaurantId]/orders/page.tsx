import { getRestaurantById } from "@/actions/restaurant-actions"
import { getRestaurantOrders } from "@/actions/order-actions"
import { formatCurrency } from "@/lib/i18n"
import { formatDate } from "@/lib/utils"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { AlertCircle, Clock, User } from "lucide-react"
import { OrderActions } from "./order-actions"
import { OrderItemActions } from "./order-item-actions"
import { type Order, type OrderItem, type OrderItemChoice, type OrderStatus } from "@prisma/client"
import { orderStatusColors } from "@/types/status-colors"

interface OrderWithRelations extends Order {
  order_items: (OrderItem & {
    menu_item: {
      name: string
    } | null
    order_item_choices: (OrderItemChoice & {
      menu_item_option: {
        name: string
      } | null
      option_choice: {
        name: string
      } | null
    })[]
  })[]
  table?: {
    number: number
  } | null
  user?: {
    name: string
    email: string
  } | null
}

export default async function RestaurantOrdersPage({
  params,
}: {
  params: { restaurantId: string }
}) {
  const { restaurantId } = params

  // Get restaurant details
  const restaurantResult = await getRestaurantById(restaurantId)
  if (!restaurantResult.success) {
    return (
      <Alert variant="destructive" className="mt-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{restaurantResult.error || "Failed to load restaurant details"}</AlertDescription>
      </Alert>
    )
  }

  // Get restaurant orders
  const ordersResult = await getRestaurantOrders(restaurantId)
  if (!ordersResult.success) {
    return (
      <div className="flex">
        <div className="flex-1 p-8">
          <h1 className="text-2xl font-bold mb-6">Orders</h1>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{ordersResult.error || "Failed to load orders"}</AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  const restaurant = restaurantResult.data
  const orders = ordersResult.data as OrderWithRelations[]

  // Status badge color mapping
  // const statusColors: Record<string, string> = {
  //   NEW: "bg-blue-500",
  //   PREPARING: "bg-yellow-500",
  //   READY: "bg-green-500",
  //   DELIVERED: "bg-purple-500",
  //   COMPLETED: "bg-gray-500",
  //   CANCELLED: "bg-red-500",
  // }

  return (
    <div className="flex">
      <div className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-6">Orders</h1>

        {orders.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">No orders found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {orders.map((order: Order) => (
              <Card key={order.id} className="overflow-hidden">
                <CardHeader className="bg-muted/50">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        Order #{order.id}
                        <Badge className={orderStatusColors[order.status as OrderStatus] || "bg-gray-500"}>{order.status}</Badge>
                      </CardTitle>
                      <CardDescription className="flex items-center mt-1">
                        <Clock className="mr-1 h-3 w-3" />
                        {formatDate(order.createdAt)}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">{formatCurrency(Number(order.total_amount))}</p>
                      <p className="text-sm text-muted-foreground">Table: {order.table?.number || "N/A"}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {/* Customer info if available */}
                    {order.user && (
                      <div className="flex items-start gap-2 text-sm">
                        <User className="h-4 w-4 mt-0.5" />
                        <div>
                          <p className="font-medium">{order.user.name}</p>
                          <p className="text-muted-foreground">{order.user.email}</p>
                        </div>
                      </div>
                    )}

                    <Separator />

                    {/* Order items */}
                    <div className="space-y-3">
                      <h3 className="font-medium">Order Items</h3>
                      <div className="space-y-2">
                        {order.order_items.map((item: OrderWithRelations['order_items'][0]) => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <div>
                              <div className="flex items-center justify-between gap-4 group relative">
                                <div className="flex-1">
                                  <div className="font-medium flex items-center gap-2">
                                    <span>{item.quantity}x {item.menu_item?.name || "Unknown Item"}</span>
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                      <OrderItemActions
                                        item={{
                                          id: item.id,
                                          status: item.status || 'NEW'
                                        }}
                                      />
                                    </div>
                                  </div>
                                  <div className="mt-1 text-sm text-muted-foreground">
                                    Status: {(item.status || 'NEW').charAt(0) + (item.status || 'NEW').slice(1).toLowerCase()}
                                  </div>
                                </div>
                                <div className="font-medium">
                                  {formatCurrency(Number(item.unit_price) * item.quantity)}
                                </div>
                              </div>

                              {/* Item choices */}
                              {item.order_item_choices && item.order_item_choices.length > 0 && (
                                <div className="ml-4 text-muted-foreground">
                                  {item.order_item_choices.map((choice: NonNullable<typeof item.order_item_choices>[0]) => (
                                    <div key={choice.id}>
                                      {choice.menu_item_option?.name}: {choice.option_choice?.name}
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Item notes */}
                              {item.notes && (
                                <div className="ml-4 text-muted-foreground italic">Note: {item.notes}</div>
                              )}
                            </div>
                            <div className="font-medium">{formatCurrency(Number(item.unit_price) * item.quantity)}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    {/* Order totals */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Subtotal</span>
                        <span>{formatCurrency(Number(order.total_amount) * 0.92)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Tax (8%)</span>
                        <span>{formatCurrency(Number(order.total_amount) * 0.08)}</span>
                      </div>
                      <div className="flex justify-between font-medium">
                        <span>Total</span>
                        <span>{formatCurrency(Number(order.total_amount))}</span>
                      </div>
                    </div>

                    {/* Order notes */}
                    {order.notes && (
                      <>
                        <Separator />
                        <div>
                          <h3 className="font-medium mb-1">Order Notes</h3>
                          <p className="text-sm text-muted-foreground">{order.notes}</p>
                        </div>
                      </>
                    )}

                    {/* Action buttons */}
                    <OrderActions order={order} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
