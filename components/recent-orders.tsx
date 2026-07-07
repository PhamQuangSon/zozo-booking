import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

export function RecentOrders({ orders }: { orders?: any[] }) {
  if (!orders || orders.length === 0) {
    return <div className="text-sm text-muted-foreground text-center py-4">No recent orders found.</div>;
  }

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150 fill-mode-both">
      {orders.map((order) => {
        const customerName = order.user?.name || `Table ${order.table?.number || '?'}`;
        const initials = customerName.substring(0, 2).toUpperCase();
        const timeAgo = formatDistanceToNow(new Date(order.createdAt), { addSuffix: true });
        
        return (
          <div 
            key={order.id} 
            className="flex items-center group rounded-xl border border-transparent p-3 transition-all hover:bg-muted/50 hover:border-border"
          >
            <Avatar className="h-10 w-10 border-2 border-background shadow-sm group-hover:scale-105 transition-transform duration-300">
              <AvatarFallback className="bg-primary/10 text-primary font-medium">{initials}</AvatarFallback>
            </Avatar>
            <div className="ml-4 space-y-1">
              <p className="text-sm font-semibold leading-none text-foreground">{customerName}</p>
              <p className="text-xs text-muted-foreground">{timeAgo}</p>
            </div>
            <div className="ml-auto text-right space-y-1.5 flex flex-col items-end">
              <Badge
                variant="outline"
                className={
                  order.status === "COMPLETED" || order.status === "PAID"
                    ? "bg-emerald-100/50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800"
                    : order.status === "PREPARING"
                      ? "bg-amber-100/50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800"
                      : "bg-blue-100/50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800"
                }
              >
                {order.status}
              </Badge>
              <p className="text-sm font-medium text-foreground">${Number(order.totalAmount).toFixed(2)}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
