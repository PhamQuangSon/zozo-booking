"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

// Menu Item actions
export async function deleteMenuItem(id: number) {
  try {
    await prisma.menuItem.delete({
      where: { id },
    })

    revalidatePath("/admin/menu-items")
    return { success: true }
  } catch (error) {
    console.error("Failed to delete menu item:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete menu item",
    }
  }
}

// Item Option actions
export async function deleteItemOption(id: number) {
  try {
    await prisma.menuItemOption.delete({
      where: { id },
    })

    revalidatePath("/admin/item-options")
    return { success: true }
  } catch (error) {
    console.error("Failed to delete item option:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete item option",
    }
  }
}

