"use server";

import {
  areAllOrderItemsAtStatus,
  orderItemStatusToOrderStatus,
  shouldReleaseTableAfterItemStatusUpdate,
} from "@/lib/order-status";
import prisma from "@/lib/prisma";
import { serializePrismaData } from "@/lib/prisma-helpers";
import { attachUsersToOrders } from "@/lib/order-helpers";
import { safePublishEvent } from "@/lib/kafka/producer";
import { KAFKA_TOPICS } from "@/lib/kafka/topics";
import type { OrderWithRelations } from "@/types/menu-builder-types";
import type { OrderItemStatus, Prisma } from "@prisma/client";

// Then fix the getRestaurantOrders function to properly handle the type conversion
export async function getRestaurantOrders(
  restaurantId: string,
): Promise<{ success: boolean; data?: OrderWithRelations[]; error?: string }> {
  try {
    const orders = await prisma.order.findMany({
      where: {
        restaurantId: Number.parseInt(restaurantId),
      },
      include: {
        table: true,
        orderItems: {
          include: {
            menuItem: true,
            orderItemChoices: {
              include: {
                optionChoice: true,
                menuItemOption: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const ordersWithUser = await attachUsersToOrders(orders);

    // Fix the serialization and type casting
    const serializedData = serializePrismaData(ordersWithUser);
    // Use a type assertion that matches the structure from menu-builder-types.ts
    return {
      success: true,
      data: serializedData as any as OrderWithRelations[],
    };
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return { success: false, error: "Failed to load orders" };
  }
}

// Also fix the updateOrderItemStatus function to use the correct OrderItem type
export async function updateOrderItemStatus(orderItemId: number, newStatus: OrderItemStatus) {
  try {
    const updatedItem = await prisma.$transaction(async (tx) => {
      // Update the order item status
      const orderItem = await tx.orderItem.update({
        where: { id: orderItemId },
        data: { status: newStatus },
        include: {
          order: {
            include: {
              orderItems: true,
              table: true,
            },
          },
        },
      });

      const allItemsSameStatus = areAllOrderItemsAtStatus(
        orderItem.order.orderItems.map((item) => item.status),
        newStatus,
      );

      // If all items have the same status, update order status
      if (allItemsSameStatus) {
        // Map item status to order status
        const orderStatus = orderItemStatusToOrderStatus[newStatus];
        await tx.order.update({
          where: { id: orderItem.order.id },
          data: { status: orderStatus },
        });

        if (orderItem.order.table) {
          const activeOrders = await tx.order.count({
            where: {
              tableId: orderItem.order.table.id,
              status: { notIn: ["COMPLETED", "CANCELLED"] },
              id: { not: orderItem.order.id },
            },
          });

          if (
            shouldReleaseTableAfterItemStatusUpdate({
              newStatus,
              activeOrdersCount: activeOrders,
              hasTable: true,
            })
          ) {
            await tx.table.update({
              where: { id: orderItem.order.table.id },
              data: { status: "AVAILABLE" },
            });
          }
        }
      }

      return orderItem;
    });

    // ── Publish to Kafka ────────────────────────────────────────────────────
    // DB cascade (Order status + Table release) is already done ABOVE inside
    // the Prisma transaction (ACID-safe, synchronous).
    //
    // This event's ONLY purpose: the Kafka consumer worker picks it up and
    // emits a Socket.IO notification to browser clients in real-time.
    // The worker does NOT touch the DB — no double-write.
    await safePublishEvent(KAFKA_TOPICS.ORDER_ITEM_STATUS_UPDATED, {
      type: "order.item.status.updated",
      payload: {
        orderItemId,
        orderId: updatedItem.order.id,
        restaurantId: updatedItem.order.restaurantId,
        tableId: updatedItem.order.tableId ?? null,
        newStatus,
        updatedAt: new Date().toISOString(),
      },
    });

    return {
      success: true,
      data: serializePrismaData(updatedItem),
    };
  } catch (error) {
    console.error("Failed to update order item status:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update order item status",
    };
  }
}

/**
 * Create a new order and emit an order.created Kafka event so the kitchen
 * dashboard receives a real-time notification.
 */
export async function createOrder(data: {
  restaurantId: number;
  tableId: number;
  userId?: string | null;
  totalAmount: number;
  notes?: string;
  orderItems: Array<{
    menuItemId: number;
    quantity: number;
    unitPrice: number;
    notes?: string;
  }>;
}) {
  try {
    const order = await prisma.order.create({
      data: {
        restaurantId: data.restaurantId,
        tableId: data.tableId,
        userId: data.userId ?? null,
        totalAmount: data.totalAmount,
        notes: data.notes,
        orderItems: {
          create: data.orderItems.map((item) => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            notes: item.notes,
          })),
        },
      },
      include: { orderItems: true, table: true },
    });

    // Mark the table as OCCUPIED
    await prisma.table.update({
      where: { id: data.tableId },
      data: { status: "OCCUPIED" },
    });

    // Publish event to Kafka
    await safePublishEvent(KAFKA_TOPICS.ORDER_CREATED, {
      type: "order.created",
      payload: {
        orderId: order.id,
        restaurantId: order.restaurantId,
        tableId: order.tableId,
        totalAmount: Number(order.totalAmount),
        userId: order.userId,
        createdAt: order.createdAt.toISOString(),
      },
    });

    return { success: true, data: serializePrismaData(order) };
  } catch (error) {
    console.error("Failed to create order:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create order",
    };
  }
}

// Option Choice CRUD
export async function createOptionChoice(data: {
  name: string;
  priceAdjustment: number;
  option_id: number;
}) {
  try {
    const choice = await prisma.optionChoice.create({
      data: {
        name: data.name,
        priceAdjustment: data.priceAdjustment,
        menuItemOption: {
          // Connect to the parent MenuItemOption
          connect: { id: data.option_id },
        },
      },
    });
    return { success: true, data: choice };
  } catch (error) {
    console.error("Failed to create option choice:", error);
    return { success: false, error: "Failed to create option choice" };
  }
}

export async function updateOptionChoice(
  id: number,
  data: {
    name: string;
    priceAdjustment: number;
  },
) {
  try {
    const choice = await prisma.optionChoice.update({
      where: { id },
      data,
    });
    return { success: true, data: choice };
  } catch (error) {
    console.error("Failed to update option choice:", error);
    return { success: false, error: "Failed to update option choice" };
  }
}

export async function deleteOptionChoice(id: number) {
  try {
    await prisma.optionChoice.delete({ where: { id } });
    return { success: true };
  } catch (error) {
    console.error("Failed to delete option choice:", error);
    return { success: false, error: "Failed to delete option choice" };
  }
}

// Reordering functions
export async function updateMenuOrder(menuId: number, newOrder: number) {
  try {
    await prisma.$executeRaw`
      UPDATE "Menu"
      SET display_order = ${newOrder}
      WHERE id = ${menuId}
    `;

    return { success: true };
  } catch (error) {
    console.error("Failed to update menu order:", error);
    return { success: false, error: "Failed to update menu order" };
  }
}

export async function updateCategoryOrder(categoryId: number, newOrder: number) {
  try {
    await prisma.$executeRaw`
      UPDATE "category"
      SET display_order = ${newOrder}
      WHERE id = ${categoryId}
    `;

    return { success: true };
  } catch (error) {
    console.error("Failed to update category order:", error);
    return { success: false, error: "Failed to update category order" };
  }
}

export async function updateMenuItemOrder(itemId: number, newOrder: number) {
  try {
    // Start transaction to ensure all updates are atomic
    await prisma.$transaction(async (prisma) => {
      const menuItem = await prisma.menuItem.findUnique({
        where: { id: itemId },
        select: { categoryId: true },
      });

      if (!menuItem) throw new Error("Menu item not found");

      // Update the specific item's order
      await prisma.menuItem.update({
        where: { id: itemId },
        data: { displayOrder: newOrder },
      });

      // Update other items' orders within the same category
      await prisma.menuItem.updateMany({
        where: {
          NOT: { id: itemId },
          categoryId: menuItem.categoryId,
          displayOrder: { gte: newOrder },
        },
        data: {
          displayOrder: { increment: 1 },
        },
      });
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to update menu item order:", error);
    return { success: false, error: "Failed to update menu item order" };
  }
}

export type OrderItemWithRelations = Prisma.OrderItemGetPayload<{
  include: {
    order: {
      include: {
        orderItems: true;
        table: true;
      };
    };
  };
}>;
