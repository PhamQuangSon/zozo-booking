"use client";

import { Check, Clock, ChefHat } from "lucide-react";
import { useState } from "react";

import { updateOrderItemStatus } from "@/actions/order-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import type { OrderWithRelations } from "@/types/menu-builder-types";
import { formatDistanceToNow } from "date-fns";
import type { OrderItemStatus } from "@prisma/client";

export function KitchenKDS({ initialOrders }: { initialOrders: OrderWithRelations[] }) {
  const [orders, setOrders] = useState<OrderWithRelations[]>(initialOrders);
  const [isUpdating, setIsUpdating] = useState<number | null>(null);
  const { toast } = useToast();

  const handleUpdateStatus = async (orderItemId: number, currentStatus: string) => {
    setIsUpdating(orderItemId);
    const nextStatus = currentStatus === "NEW" ? "PREPARING" : "READY";
    
    try {
      const result = await updateOrderItemStatus(orderItemId, nextStatus as any);
      
      if (result.success) {
        setOrders((prev) => {
          const newOrders = prev.map((order) => {
            const updatedItems = order.orderItems.map((item) => 
              item.id === orderItemId ? { ...item, status: nextStatus as OrderItemStatus } : item
            );
            
            // Remove the item from view if it's READY
            const filteredItems = updatedItems.filter(item => item.status === "NEW" || item.status === "PREPARING");
            
            return {
              ...order,
              orderItems: filteredItems
            } as OrderWithRelations;
          }).filter(order => order.orderItems.length > 0); // Remove empty orders

          return newOrders;
        });
        
        toast({
          title: "Status updated",
          description: `Item marked as ${nextStatus.toLowerCase()}`,
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update status",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(null);
    }
  };

  if (orders.length === 0) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center text-muted-foreground">
        <ChefHat className="mb-4 h-16 w-16 opacity-20" />
        <h2 className="text-2xl font-semibold">No active orders</h2>
        <p>Kitchen is clear! Take a break.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
      {orders.map((order) => (
        <Card key={order.id} className="flex flex-col border-2 overflow-hidden shadow-sm">
          <CardHeader className="bg-muted pb-4 border-b">
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl">
                Table {order.table?.number || "Takeout"}
              </CardTitle>
              <div className="text-sm font-medium flex items-center text-muted-foreground bg-background px-2 py-1 rounded-md shadow-sm">
                <Clock className="mr-1 h-4 w-4" />
                {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
              </div>
            </div>
            <div className="text-sm mt-1">
              Order #{order.id} • {order.user?.name || "Guest"}
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-0">
            <div className="divide-y">
              {order.orderItems.map((item) => (
                <div key={item.id} className="p-4 flex flex-col gap-3">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <div className="font-semibold text-lg flex items-center gap-2">
                        <span className="bg-primary text-primary-foreground px-2 py-0.5 rounded text-sm min-w-8 text-center shadow-sm">
                          {item.quantity}x
                        </span>
                        {item.menuItem.name}
                      </div>
                      
                      {item.orderItemChoices && item.orderItemChoices.length > 0 && (
                        <div className="text-sm text-muted-foreground mt-1 ml-10">
                          {item.orderItemChoices.map(choice => choice.optionChoice?.name).filter(Boolean).join(", ")}
                        </div>
                      )}
                      
                      {item.notes && (
                        <div className="text-sm text-amber-600 bg-amber-50 p-2 rounded mt-2 ml-10 font-medium border border-amber-200">
                          Note: {item.notes}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-2">
                    {item.status === "NEW" ? (
                      <Button 
                        className="w-full text-lg h-14 bg-blue-600 hover:bg-blue-700 shadow-md" 
                        onClick={() => handleUpdateStatus(item.id, "NEW")}
                        disabled={isUpdating === item.id}
                      >
                        Start Preparing
                      </Button>
                    ) : (
                      <Button 
                        className="w-full text-lg h-14 bg-green-600 hover:bg-green-700 shadow-md" 
                        onClick={() => handleUpdateStatus(item.id, "PREPARING")}
                        disabled={isUpdating === item.id}
                      >
                        <Check className="mr-2 h-6 w-6" /> Ready to Serve
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
