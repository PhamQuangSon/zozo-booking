"use client"

import { useState } from "react"
import { MoreHorizontal, Search, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/i18n"
import { useCurrencyStore } from "@/lib/currency-store"

// Mock data - in a real app, this would come from the database
const orders = [
  {
    id: "ORD-001",
    customer: "John Doe",
    table: "Table 1",
    items: ["Spaghetti Carbonara", "Bruschetta"],
    total: 24.98,
    status: "completed",
    time: "2023-03-20T10:30:00",
  },
  {
    id: "ORD-002",
    customer: "Jane Smith",
    table: "Table 5",
    items: ["Lasagna", "Caprese Salad"],
    total: 26.98,
    status: "preparing",
    time: "2023-03-20T10:15:00",
  },
  {
    id: "ORD-003",
    customer: "Bob Johnson",
    table: "Table 3",
    items: ["Fettuccine Alfredo", "Calamari"],
    total: 25.98,
    status: "new",
    time: "2023-03-20T10:28:00",
  },
  {
    id: "ORD-004",
    customer: "Alice Brown",
    table: "Table 2",
    items: ["Chicken Parmesan", "Bruschetta"],
    total: 27.98,
    status: "completed",
    time: "2023-03-20T10:00:00",
  },
  {
    id: "ORD-005",
    customer: "Charlie Wilson",
    table: "Table 4",
    items: ["Eggplant Parmesan", "Caprese Salad"],
    total: 26.98,
    status: "preparing",
    time: "2023-03-20T10:10:00",
  },
  {
    id: "ORD-006",
    customer: "David Lee",
    table: "Table 6",
    items: ["Grilled Salmon", "Calamari"],
    total: 33.98,
    status: "new",
    time: "2023-03-20T10:25:00",
  },
  {
    id: "ORD-007",
    customer: "Eva Garcia",
    table: "Table 7",
    items: ["Spaghetti Carbonara", "Bruschetta"],
    total: 24.98,
    status: "completed",
    time: "2023-03-20T09:45:00",
  },
  {
    id: "ORD-008",
    customer: "Frank Miller",
    table: "Table 8",
    items: ["Lasagna", "Caprese Salad"],
    total: 26.98,
    status: "preparing",
    time: "2023-03-20T09:55:00",
  },
]

export default function OrdersPage() {
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const { currency } = useCurrencyStore()

  const filteredOrders = orders.filter((order) => {
    const matchesStatus = statusFilter === "all" || order.status === statusFilter
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.table.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesStatus && matchesSearch
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "default"
      case "preparing":
        return "outline"
      case "new":
        return "secondary"
      default:
        return "default"
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Orders</h2>
        <Button>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search orders..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="preparing">Preparing</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Table</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>{order.customer}</TableCell>
                  <TableCell>{order.table}</TableCell>
                  <TableCell>{order.items.join(", ")}</TableCell>
                  <TableCell>{formatDate(order.time)}</TableCell>
                  <TableCell>{formatCurrency(order.total, currency)}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(order.status)}>{order.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>View details</DropdownMenuItem>
                        <DropdownMenuItem>Update status</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Print receipt</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

