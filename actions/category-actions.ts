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
}) {
  try {
    const category = await prisma.category.create({ data })
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
    display_order: number
  },
) {
  try {
    const category = await prisma.category.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        restaurantId: data.restaurantId,
        displayOrder: data.display_order,
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

