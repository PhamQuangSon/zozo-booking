"use server";

import prisma from "@/lib/prisma";
import { serializePrismaData } from "@/lib/prisma-helpers";
import type { OrderWithRelations } from "@/types/menu-builder-types";
import { OrderItemStatus, OrderStatus, type Prisma } from "@prisma/client";

// Map order item status to order status
const orderItemStatusToOrderStatus: Record<OrderItemStatus, OrderStatus> = {
  [OrderItemStatus.NEW]: OrderStatus.NEW,
  [OrderItemStatus.PREPARING]: OrderStatus.PREPARING,
  [OrderItemStatus.READY]: OrderStatus.PREPARING,
  [OrderItemStatus.DELIVERED]: OrderStatus.PREPARING,
  [OrderItemStatus.COMPLETED]: OrderStatus.COMPLETED,
  [OrderItemStatus.CANCELLED]: OrderStatus.CANCELLED,
};

// Then fix the getRestaurantOrders function to properly handle the type conversion
export async function getRestaurantOrders(
  restaurantId: string
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

    const ordersWithUser = await Promise.all(
      orders.map(async (order) => {
        if (order.userId) {
          const user = await prisma.user.findUnique({
            where: { id: order.userId },
            select: { name: true, email: true },
          });
          return { ...order, user };
        }
        return {
          ...order,
          user: {
            name: null,
            email: null,
          },
        };
      })
    );

    // Fix the serialization and type casting
    const serializedData = serializePrismaData(ordersWithUser);
    // Use a type assertion that matches the structure from menu-builder-types.ts
    return {
      success: true,
      data: serializedData as unknown as OrderWithRelations[],
    };
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return { success: false, error: "Failed to load orders" };
  }
}

// Also fix the updateOrderItemStatus function to use the correct OrderItem type
export async function updateOrderItemStatus(
  orderItemId: number,
  newStatus: OrderItemStatus
) {
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

      // Check if all items in the order have the same status
      const allItemsSameStatus = orderItem.order.orderItems.every(
        (item) => item.status === newStatus
      );

      // If all items have the same status, update order status
      if (allItemsSameStatus) {
        // Map item status to order status
        const orderStatus = orderItemStatusToOrderStatus[newStatus];
        await tx.order.update({
          where: { id: orderItem.order.id },
          data: { status: orderStatus },
        });

        // If order is completed/cancelled & has a table, check if table can be freed
        if (
          (newStatus === "COMPLETED" || newStatus === "CANCELLED") &&
          orderItem.order.table
        ) {
          const activeOrders = await tx.order.count({
            where: {
              tableId: orderItem.order.table.id,
              status: { notIn: ["COMPLETED", "CANCELLED"] },
              id: { not: orderItem.order.id },
            },
          });

          // If no other active orders, update table status
          if (activeOrders === 0) {
            await tx.table.update({
              where: { id: orderItem.order.table.id },
              data: { status: "AVAILABLE" },
            });
          }
        }
      }

      return orderItem;
    });

    return {
      success: true,
      data: serializePrismaData(updatedItem),
    };
  } catch (error) {
    console.error("Failed to update order item status:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update order item status",
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
  }
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

export async function updateCategoryOrder(
  categoryId: number,
  newOrder: number
) {
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
