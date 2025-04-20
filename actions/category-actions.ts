"use server";

import { revalidatePath } from "next/cache";

import prisma from "@/lib/prisma";
import { serializePrismaData } from "@/lib/prisma-helpers";

// Get all Category
export async function getCategories() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        restaurant: true,
      },
      orderBy: {
        restaurant: {
          name: "asc",
        },
      },
    });

    return { success: true, data: serializePrismaData(categories) };
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to load categories",
      data: [],
    };
  }
}

// Category CRUD
export async function createCategory(data: {
  name: string;
  description: string | null;
  restaurantId: number;
  displayOrder: number;
  imageUrl?: string | null;
}) {
  try {
    const category = await prisma.category.create({
      data: {
        name: data.name,
        description: data.description,
        restaurantId: data.restaurantId,
        displayOrder: data.displayOrder,
        imageUrl: data.imageUrl || null,
      },
    });
    revalidatePath("/admin/categories");
    return { success: true, data: category };
  } catch (error) {
    console.error("Failed to create category:", error);
    return { success: false, error: "Failed to create category" };
  }
}

export async function updateCategory(
  id: number,
  data: {
    name: string;
    description: string | null;
    restaurantId: number;
    displayOrder?: number;
    imageUrl?: string | null;
  }
) {
  try {
    const category = await prisma.category.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        restaurantId: data.restaurantId,
        displayOrder: data.displayOrder || 0,
        imageUrl: data.imageUrl,
      },
    });
    revalidatePath("/admin/categories");
    return { success: true, data: category };
  } catch (error) {
    console.error("Failed to update category:", error);
    return { success: false, error: "Failed to update category" };
  }
}

export async function deleteCategory(id: number) {
  try {
    await prisma.category.delete({ where: { id } });
    revalidatePath("/admin/categories");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete category:", error);
    return { success: false, error: "Failed to delete category" };
  }
}

// Update category display order
export async function updateCategoryDisplayOrder(
  categoryId: number,
  targetCategoryId: number
) {
  try {
    // Get both categories to determine their current display orders
    const sourceCategory = await prisma.category.findUnique({
      where: { id: categoryId },
      select: { displayOrder: true, restaurantId: true },
    });

    const targetCategory = await prisma.category.findUnique({
      where: { id: targetCategoryId },
      select: { displayOrder: true },
    });

    if (!sourceCategory || !targetCategory) {
      return { success: false, error: "One or both categories not found" };
    }

    // Update the source category's display order to match the target
    await prisma.category.update({
      where: { id: categoryId },
      data: { displayOrder: targetCategory.displayOrder },
    });

    // Revalidate paths
    revalidatePath("/admin/categories");
    if (sourceCategory.restaurantId) {
      revalidatePath(`/admin/restaurants/${sourceCategory.restaurantId}/menu`);
      // revalidatePath(`/admin/restaurants/${sourceCategory.restaurantId}/menu/categories`)
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to update category display order:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update category display order",
    };
  }
}
