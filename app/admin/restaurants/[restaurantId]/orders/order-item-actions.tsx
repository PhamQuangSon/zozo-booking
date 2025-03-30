"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { updateOrderItemStatus } from "@/actions/order-actions"
import { OrderItemStatus } from "@prisma/client"
import { useRouter } from "next/navigation"
import { orderItemStatusColors } from "@/types/status-colors"

interface OrderItemActionsProps {
  item: {
    id: number
    status: OrderItemStatus
  }
}

export function OrderItemActions({ item }: OrderItemActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  // Available status transitions
  const getAvailableStatuses = (currentStatus: OrderItemStatus): OrderItemStatus[] => {
    switch (currentStatus) {
      case "NEW":
        return ["PREPARING", "CANCELLED"]
      case "PREPARING":
        return ["READY", "CANCELLED"]
      case "READY":
        return ["DELIVERED", "CANCELLED"]
      case "DELIVERED":
        return ["COMPLETED"]
      case "COMPLETED":
        return []
      case "CANCELLED":
        return []
      default:
        return []
    }
  }

  const handleStatusUpdate = async (newStatus: OrderItemStatus) => {
    try {
      setLoading(true)
      const result = await updateOrderItemStatus(item.id, newStatus)
      if (result.success) {
        router.refresh()
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Badge
        className={`transition-colors duration-200 ${orderItemStatusColors[item.status] || "bg-gray-500"} ${
          loading ? "opacity-50" : ""
        }`}
      >
        {item.status.charAt(0) + item.status.slice(1).toLowerCase()}
      </Badge>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            disabled={loading}
            className="h-7 px-2 transition-all duration-200"
          >
            {loading ? (
              <div className="flex items-center gap-1">
                <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                <span>Updating...</span>
              </div>
            ) : (
              "Update"
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-32">
          {getAvailableStatuses(item.status).map((status) => (
            <DropdownMenuItem
              key={status}
              onClick={() => handleStatusUpdate(status)}
              disabled={loading}
              className="justify-between font-medium"
            >
              {status.charAt(0) + status.slice(1).toLowerCase()}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
