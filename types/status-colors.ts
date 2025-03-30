import { OrderStatus, OrderItemStatus, TableStatus } from "@prisma/client"

export const orderStatusColors: Record<OrderStatus, string> = {
  NEW: "bg-blue-500",
  PREPARING: "bg-yellow-500",
  COMPLETED: "bg-gray-500",
  CANCELLED: "bg-red-500",
}

export const orderItemStatusColors: Record<OrderItemStatus, string> = {
  NEW: "bg-blue-500",
  PREPARING: "bg-yellow-500",
  READY: "bg-green-500",
  DELIVERED: "bg-purple-500",
  COMPLETED: "bg-gray-500",
  CANCELLED: "bg-red-500",
}

export const tableStatusColors: Record<TableStatus, string> = {
  AVAILABLE: "bg-green-500",
  OCCUPIED: "bg-yellow-500",
  RESERVED: "bg-blue-500",
  MAINTENANCE: "bg-red-500",
}