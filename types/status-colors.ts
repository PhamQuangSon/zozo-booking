import type { OrderItemStatus, OrderStatus, TableStatus } from "@prisma/client";

export const orderStatusColors: Record<OrderStatus, string> = {
  NEW: "bg-blue-500 text-white",
  PREPARING: "bg-yellow-500 text-white",
  COMPLETED: "bg-gray-500 text-white",
  CANCELLED: "bg-red-500 text-white",
};

export const orderItemStatusColors: Record<OrderItemStatus, string> = {
  NEW: "bg-blue-500 text-white",
  PREPARING: "bg-yellow-500 text-white",
  READY: "bg-green-500 text-white",
  DELIVERED: "bg-purple-500 text-white",
  COMPLETED: "bg-gray-500 text-white",
  CANCELLED: "bg-red-500 text-white",
};

export const tableStatusColors: Record<TableStatus, string> = {
  AVAILABLE: "bg-green-500 text-white",
  OCCUPIED: "bg-yellow-500 text-white",
  RESERVED: "bg-blue-500 text-white",
  MAINTENANCE: "bg-red-500 text-white",
};
