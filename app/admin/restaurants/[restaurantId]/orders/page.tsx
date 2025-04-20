import { AlertCircle, Clock, User } from "lucide-react";

import { getRestaurantOrders } from "@/actions/order-actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/i18n";
import { formatDate } from "@/lib/utils";
import type { PageProps } from "@/types/page-props";
import { orderStatusColors } from "@/types/status-colors";

import { OrderActions } from "./order-actions";
import { OrderItemActions } from "./order-item-actions";

export default async function RestaurantOrdersPage({ params }: PageProps) {
  const { restaurantId } = params;

  // Get restaurant orders
  const ordersResult = await getRestaurantOrders(restaurantId);
  if (!ordersResult.success) {
    return (
      <div className="flex">
        <div className="flex-1 p-8">
          <h1 className="text-2xl font-bold mb-6">Orders</h1>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {ordersResult.error || "Failed to load orders"}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const orders = ordersResult.data || [];

  return (
    <div className="flex">
      <div className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-6">Orders</h1>
        {!orders || orders.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                No orders found
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {orders.map((order) => (
              <Card key={order.id} className="overflow-hidden">
                <CardHeader className="bg-muted/50">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        Order #{order.id}
                        <Badge
                          className={
                            orderStatusColors[order.status] || "bg-gray-500"
                          }
                        >
                          {order.status}
                        </Badge>
                      </CardTitle>
                      <CardDescription className="flex items-center mt-1">
                        <Clock className="mr-1 h-3 w-3" />
                        {formatDate(order.createdAt.toString())}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">
                        {formatCurrency(Number(order.totalAmount))}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Table: {order.table?.number || "N/A"}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {/* Customer info if available */}
                    {order.user ? (
                      <div className="flex items-start gap-2 text-sm">
                        <User className="h-4 w-4 mt-0.5" />
                        <div>
                          <p className="font-medium">
                            {order.user.name || "Anonymous User"}
                          </p>
                          <p className="text-muted-foreground">
                            {order.user.email}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-2 text-sm">
                        <User className="h-4 w-4 mt-0.5" />
                        <div>
                          <p className="font-medium">Guest Order</p>
                          {order.notes &&
                            order.notes.includes("Customer Info:") && (
                              <p className="text-muted-foreground">
                                {order.notes.split("Customer Info:")[1].trim()}
                              </p>
                            )}
                        </div>
                      </div>
                    )}

                    <Separator />

                    {/* Order items */}
                    <div className="space-y-3">
                      <h3 className="font-medium">Order Items</h3>
                      <div className="space-y-2">
                        {order.orderItems &&
                          order.orderItems.map((item) => (
                            <div
                              key={item.id}
                              className="flex justify-between text-sm"
                            >
                              <div className="flex-1">
                                <div className="flex items-center justify-between gap-4 group relative">
                                  <div className="flex-1">
                                    <div className="font-medium flex items-center gap-2">
                                      <span>
                                        {item.quantity}x{" "}
                                        {item.menuItem?.name || "Unknown Item"}
                                      </span>
                                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                        <OrderItemActions
                                          item={{
                                            id: item.id,
                                            status: item.status,
                                          }}
                                        />
                                      </div>
                                    </div>
                                    <div className="mt-1 text-sm text-muted-foreground">
                                      Status:{" "}
                                      {item.status.charAt(0) +
                                        item.status.slice(1).toLowerCase()}
                                    </div>
                                  </div>
                                  <div className="font-medium">
                                    {formatCurrency(
                                      Number(item.unitPrice) * item.quantity
                                    )}
                                  </div>
                                </div>

                                {/* Item choices */}
                                {item.orderItemChoices &&
                                  item.orderItemChoices.length > 0 && (
                                    <div className="ml-4 text-muted-foreground">
                                      {item.orderItemChoices.map((choice) => (
                                        <div key={choice.id}>
                                          {choice.menuItemOption?.name}:{" "}
                                          {choice.optionChoice?.name}
                                        </div>
                                      ))}
                                    </div>
                                  )}

                                {/* Item notes */}
                                {item.notes && (
                                  <div className="ml-4 text-muted-foreground italic">
                                    Note: {item.notes}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>

                    <Separator />

                    {/* Order totals */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Subtotal</span>
                        <span>
                          {formatCurrency(Number(order.totalAmount) * 0.92)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Tax (8%)</span>
                        <span>
                          {formatCurrency(Number(order.totalAmount) * 0.08)}
                        </span>
                      </div>
                      <div className="flex justify-between font-medium">
                        <span>Total</span>
                        <span>{formatCurrency(Number(order.totalAmount))}</span>
                      </div>
                    </div>

                    {order.notes && !order.notes.includes("Customer Info:") && (
                      <>
                        <Separator />
                        <div>
                          <h3 className="font-medium mb-1">Order Notes</h3>
                          <p className="text-sm text-muted-foreground">
                            {order.notes}
                          </p>
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
  );
}
