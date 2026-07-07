"use client";

import { CreditCard, DollarSign, Receipt, Clock, CheckCircle } from "lucide-react";
import { useState, useMemo } from "react";

import { updateOrderStatus } from "@/actions/order-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import type { OrderWithRelations } from "@/types/menu-builder-types";
import { formatDistanceToNow } from "date-fns";

export function CashierPOS({ initialOrders }: { initialOrders: OrderWithRelations[] }) {
  const [orders, setOrders] = useState<OrderWithRelations[]>(initialOrders);
  const [isUpdating, setIsUpdating] = useState<number | null>(null);
  const { toast } = useToast();

  // Filter out PAID and CANCELLED orders
  const activeOrders = useMemo(() => {
    return orders.filter(
      (order) => order.status !== "PAID" && order.status !== "CANCELLED"
    );
  }, [orders]);

  const handleUpdateStatus = async (orderId: number, nextStatus: string) => {
    setIsUpdating(orderId);
    
    try {
      const result = await updateOrderStatus(orderId, nextStatus as any);
      
      if (result.success) {
        setOrders((prev) => 
          prev.map((order) => 
            order.id === orderId ? { ...order, status: nextStatus as any } : order
          )
        );
        
        toast({
          title: "Order Updated",
          description: `Order marked as ${nextStatus.toLowerCase()}`,
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update order",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(null);
    }
  };

  if (activeOrders.length === 0) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center text-muted-foreground">
        <Receipt className="mb-4 h-16 w-16 opacity-20" />
        <h2 className="text-2xl font-semibold">No active orders</h2>
        <p>All tables are settled.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
      {activeOrders.map((order) => {
        return (
          <Card key={order.id} className="flex flex-col border-2 shadow-md">
            <CardHeader className="bg-muted pb-4 border-b">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl">
                  Table {order.table?.number || "Takeout"}
                </CardTitle>
                <Badge variant={order.status === "COMPLETED" ? "default" : "secondary"}>
                  {order.status}
                </Badge>
              </div>
              <div className="text-sm mt-1 flex justify-between text-muted-foreground">
                <span>Order #{order.id} • {order.user?.name || "Guest"}</span>
                <span className="flex items-center bg-background px-2 py-0.5 rounded shadow-sm">
                  <Clock className="mr-1 h-3 w-3" />
                  {formatDistanceToNow(new Date(order.createdAt))}
                </span>
              </div>
            </CardHeader>
            <CardContent className="flex-1 pt-4">
              <div className="space-y-4">
                <div className="max-h-[250px] overflow-y-auto pr-2 space-y-2">
                  {order.orderItems.map((item) => (
                    <div key={item.id} className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground bg-secondary px-1.5 py-0.5 rounded text-xs">{item.quantity}x</span>
                        <span className="font-medium">{item.menuItem.name}</span>
                      </div>
                      <div className="tabular-nums">
                        ${(Number(item.unitPrice) * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="pt-4 border-t border-dashed flex justify-between items-center">
                  <span className="font-bold text-lg">Total</span>
                  <span className="font-bold text-2xl text-primary tabular-nums">
                    ${Number(order.totalAmount).toFixed(2)}
                  </span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/30 border-t p-4 flex gap-2">
              {order.status !== "COMPLETED" && (
                <Button 
                  className="flex-1 bg-amber-600 hover:bg-amber-700 h-12" 
                  onClick={() => handleUpdateStatus(order.id, "COMPLETED")}
                  disabled={isUpdating === order.id}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Finish Dining
                </Button>
              )}
              
              <Button 
                className="flex-1 bg-green-600 hover:bg-green-700 h-12"
                onClick={() => handleUpdateStatus(order.id, "PAID")}
                disabled={isUpdating === order.id}
              >
                <DollarSign className="mr-2 h-4 w-4" />
                Pay & Close
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
