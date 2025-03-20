import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

// Mock data - in a real app, this would come from the database
const recentOrders = [
  {
    id: "ORD-001",
    customer: "John Doe",
    items: ["Spaghetti Carbonara", "Bruschetta"],
    total: 24.98,
    status: "completed",
    time: "10 minutes ago",
  },
  {
    id: "ORD-002",
    customer: "Jane Smith",
    items: ["Lasagna", "Caprese Salad"],
    total: 26.98,
    status: "preparing",
    time: "15 minutes ago",
  },
  {
    id: "ORD-003",
    customer: "Bob Johnson",
    items: ["Fettuccine Alfredo", "Calamari"],
    total: 25.98,
    status: "new",
    time: "2 minutes ago",
  },
  {
    id: "ORD-004",
    customer: "Alice Brown",
    items: ["Chicken Parmesan", "Bruschetta"],
    total: 27.98,
    status: "completed",
    time: "30 minutes ago",
  },
  {
    id: "ORD-005",
    customer: "Charlie Wilson",
    items: ["Eggplant Parmesan", "Caprese Salad"],
    total: 26.98,
    status: "preparing",
    time: "20 minutes ago",
  },
]

export function RecentOrders() {
  return (
    <div className="space-y-8">
      {recentOrders.map((order) => (
        <div key={order.id} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarFallback>
              {order.customer
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{order.customer}</p>
            <p className="text-sm text-muted-foreground">{order.items.join(", ")}</p>
          </div>
          <div className="ml-auto text-right">
            <Badge
              variant={
                order.status === "completed" ? "default" : order.status === "preparing" ? "outline" : "secondary"
              }
            >
              {order.status}
            </Badge>
            <p className="text-sm text-muted-foreground">${order.total.toFixed(2)}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

