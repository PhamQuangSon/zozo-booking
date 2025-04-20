"use server";

import { revalidatePath } from "next/cache";

import prisma from "@/lib/prisma";
import { serializePrismaData } from "@/lib/prisma-helpers";

// Get all menu items
export async function getMenuItems() {
  try {
    const menuItems = await prisma.menuItem.findMany({
      include: {
        category: true,
        restaurant: true,
        menuItemOptions: {
          include: {
            optionChoices: true,
          },
        },
      },
      orderBy: {
        restaurant: {
          name: "asc",
        },
      },
    });

    return { success: true, data: serializePrismaData(menuItems) };
  } catch (error) {
    console.error("Failed to fetch menu items:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to load menu items",
      data: [],
    };
  }
}

// Menu Item CRUD
export async function createMenuItem(data: {
  name: string;
  description: string | null;
  price: number;
  categoryId: number;
  restaurantId: number;
  isAvailable: boolean;
  displayOrder: number;
  imageUrl?: string | null;
}) {
  try {
    const menuItem = await prisma.menuItem.create({
      data: {
        name: data.name,
        description: data.description,
        price: parseFloat(data.price.toFixed(2)),
        categoryId: data.categoryId,
        restaurantId: data.restaurantId,
        isAvailable: data.isAvailable,
        displayOrder: data.displayOrder,
        imageUrl: data.imageUrl || null,
      },
    });
    revalidatePath("/admin/menu-items");
    return { success: true, data: menuItem };
  } catch (error) {
    console.error("Failed to create menu item:", error);
    return { success: false, error: "Failed to create menu item" };
  }
}

export async function updateMenuItem(
  id: number,
  data: {
    name: string;
    description: string | null;
    price: number;
    categoryId: number;
    restaurantId: number;
    isAvailable: boolean;
    displayOrder?: number;
    imageUrl?: string | null;
  },
) {
  try {
    const menuItem = await prisma.menuItem.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        price: parseFloat(data.price.toFixed(2)),
        categoryId: data.categoryId,
        restaurantId: data.restaurantId,
        isAvailable: data.isAvailable,
        displayOrder: data.displayOrder ?? 0,
        imageUrl: data.imageUrl,
      },
    });
    revalidatePath("/admin/menu-items");
    return { success: true, data: menuItem };
  } catch (error) {
    console.error("Failed to update menu item:", error);
    return { success: false, error: "Failed to update menu item" };
  }
}

export async function deleteMenuItem(id: number) {
  try {
    // Get the menu item to find its restaurantId for path revalidation
    const menuItem = await prisma.menuItem.findUnique({
      where: { id },
      select: { restaurantId: true },
    });

    await prisma.menuItem.delete({ where: { id } });

    revalidatePath("/admin/menu-items");
    if (menuItem?.restaurantId) {
      revalidatePath(`/admin/restaurants/${menuItem.restaurantId}/menu`);
    }
    return { success: true };
  } catch (error) {
    console.error("Failed to delete menu item:", error);
    return { success: false, error: "Failed to delete menu item" };
  }
}

// Update menu item display order
export async function updateMenuItemOrder(id: number, displayOrder: number) {
  try {
    // Get the menu item to find its restaurantId for path revalidation
    const menuItem = await prisma.menuItem.findUnique({
      where: { id },
      select: { restaurantId: true },
    });

    await prisma.menuItem.update({
      where: { id },
      data: { displayOrder },
    });

    if (menuItem?.restaurantId) {
      revalidatePath(`/admin/restaurants/${menuItem.restaurantId}/menu`);
    }
    return { success: true };
  } catch (error) {
    console.error("Failed to update menu item display order:", error);
    return {
      success: false,
      error: "Failed to update menu item display order",
    };
  }
}
