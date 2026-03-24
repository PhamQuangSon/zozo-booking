import type { OrderItemStatus, OrderStatus } from "@prisma/client";

export const orderItemStatusToOrderStatus: Record<
  OrderItemStatus,
  OrderStatus
> = {
  NEW: "NEW",
  PREPARING: "PREPARING",
  READY: "PREPARING",
  DELIVERED: "PREPARING",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
};

export function areAllOrderItemsAtStatus(
  statuses: OrderItemStatus[],
  target: OrderItemStatus
): boolean {
  return statuses.length > 0 && statuses.every((status) => status === target);
}

export function shouldReleaseTableAfterItemStatusUpdate(params: {
  newStatus: OrderItemStatus;
  activeOrdersCount: number;
  hasTable: boolean;
}): boolean {
  const isTerminalStatus =
    params.newStatus === "COMPLETED" || params.newStatus === "CANCELLED";

  return isTerminalStatus && params.hasTable && params.activeOrdersCount === 0;
}
