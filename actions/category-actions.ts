"use server"

import prisma from "@/lib/prisma"
import { serializePrismaData } from "@/lib/prisma-helpers"
import { revalidatePath } from "next/cache"

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
    })

    return { success: true, data: serializePrismaData(categories) }
  } catch (error) {
    console.error("Failed to fetch categories:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to load categories",
      data: [],
    }
  }
}

// Category CRUD
export async function createCategory(data: {
  name: string
  description: string | null
  restaurantId: number
  displayOrder: number
  imageUrl?: string | null
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
    })
    revalidatePath("/admin/categories")
    return { success: true, data: category }
  } catch (error) {
    console.error("Failed to create category:", error)
    return { success: false, error: "Failed to create category" }
  }
}

export async function updateCategory(
  id: number,
  data: {
    name: string
    description: string | null
    restaurantId: number
    displayOrder?: number
    imageUrl?: string | null
  },
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
    })
    revalidatePath("/admin/categories")
    return { success: true, data: category }
  } catch (error) {
    console.error("Failed to update category:", error)
    return { success: false, error: "Failed to update category" }
  }
}

export async function deleteCategory(id: number) {
  try {
    await prisma.category.delete({ where: { id } })
    revalidatePath("/admin/categories")
    return { success: true }
  } catch (error) {
    console.error("Failed to delete category:", error)
    return { success: false, error: "Failed to delete category" }
  }
}


// Update category display order
export async function updateCategoryDisplayOrder(categoryId: number, targetOrderId: number) {
  try {
    // Get the category to update
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      select: { restaurantId: true }
    });

    if (!category) {
      return { success: false, error: "Category not found" };
    }

    // Get the target category to get its display order
    const targetCategory = await prisma.category.findUnique({
      where: { id: targetOrderId },
      select: { displayOrder: true }
    });

    if (!targetCategory) {
      return { success: false, error: "Target category not found" };
    }

    // Update the category's display order
    const updatedCategory = await prisma.category.update({
      where: { id: categoryId },
      data: { displayOrder: targetCategory.displayOrder }
    });

    // Revalidate paths
    revalidatePath("/admin/categories");
    revalidatePath(`/admin/restaurants/${category.restaurantId}/menu`);
    
    return { success: true, data: updatedCategory };
  } catch (error) {
    console.error("Failed to update category display order:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to update category display order" 
    };
  }
}

