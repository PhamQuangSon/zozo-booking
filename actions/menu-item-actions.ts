"use server"

import prisma from "@/lib/prisma"
import { serializePrismaData } from "@/lib/prisma-helpers"
import { revalidatePath } from "next/cache"

// Get all Category
export async function getMenuItems() {
  try {
    const menus = await prisma.menuItem.findMany({
      include: {
        restaurant: true,
      },
      orderBy: {
        restaurant: {
          name: "asc",
        },
      },
    })

    return { success: true, data: serializePrismaData(menus) }
  } catch (error) {
    console.error("Failed to fetch menus:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to load menus",
      data: [],
    }
  }
}

// Menu Item CRUD
export async function createMenuItem(data: {
  name: string
  description: string | null
  price: number
  imageUrl: string | null
  category_id: number
  is_available: boolean
  display_order: number
}) {
  try {
    const item = await prisma.menuItem.create({ data })
    return { success: true, data: item }
  } catch (error) {
    console.error('Failed to create menu item:', error)
    return { success: false, error: 'Failed to create menu item' }
  }
}

export async function updateMenuItem(id: number, data: {
  name: string
  description: string | null
  price: number
  imageUrl: string | null
  is_available: boolean
  display_order: number
}) {
  try {
    const item = await prisma.menuItem.update({
      where: { id },
      data
    })
    return { success: true, data: item }
  } catch (error) {
    console.error('Failed to update menu item:', error)
    return { success: false, error: 'Failed to update menu item' }
  }
}

export async function deleteMenuItem(id: number) {
  try {
    await prisma.menuItem.delete({ where: { id } })
    return { success: true }
  } catch (error) {
    console.error('Failed to delete menu item:', error)
    return { success: false, error: 'Failed to delete menu item' }
  }
}

// Option Choice CRUD
export async function createOptionChoice(data: {
  name: string
  priceAdjustment: number
  option_id: number
}) {
  try {
    const choice = await prisma.optionChoice.create({ data })
    return { success: true, data: choice }
  } catch (error) {
    console.error('Failed to create option choice:', error)
    return { success: false, error: 'Failed to create option choice' }
  }
}

export async function updateOptionChoice(id: number, data: {
  name: string
  priceAdjustment: number
}) {
  try {
    const choice = await prisma.optionChoice.update({
      where: { id },
      data
    })
    return { success: true, data: choice }
  } catch (error) {
    console.error('Failed to update option choice:', error)
    return { success: false, error: 'Failed to update option choice' }
  }
}

export async function deleteOptionChoice(id: number) {
  try {
    await prisma.optionChoice.delete({ where: { id } })
    return { success: true }
  } catch (error) {
    console.error('Failed to delete option choice:', error)
    return { success: false, error: 'Failed to delete option choice' }
  }
}

// Reordering functions
export async function updateMenuOrder(menuId: number, newOrder: number) {
  try {
    await prisma.$executeRaw`
      UPDATE "Menu"
      SET display_order = ${newOrder}
      WHERE id = ${menuId}
    `

    return { success: true }
  } catch (error) {
    console.error('Failed to update menu order:', error)
    return { success: false, error: 'Failed to update menu order' }
  }
}

export async function updateCategoryOrder(categoryId: number, newOrder: number) {
  try {
    await prisma.$executeRaw`
      UPDATE "category"
      SET display_order = ${newOrder}
      WHERE id = ${categoryId}
    `

    return { success: true }
  } catch (error) {
    console.error('Failed to update category order:', error)
    return { success: false, error: 'Failed to update category order' }
  }
}

export async function updateMenuItemOrder(itemId: number, newOrder: number) {
  try {
    // Start transaction to ensure all updates are atomic
    await prisma.$transaction(async (prisma) => {
      const menuItem = await prisma.menuItem.findUnique({
        where: { id: itemId },
        select: { category_id: true }
      })

      if (!menuItem) throw new Error('Menu item not found')

      // Update the specific item's order
      await prisma.menuItem.update({
        where: { id: itemId },
        data: { display_order: newOrder }
      })

      // Update other items' orders within the same category
      await prisma.menuItem.updateMany({
        where: {
          NOT: { id: itemId },
          category_id: menuItem.category_id,
          display_order: { gte: newOrder }
        },
        data: {
          display_order: { increment: 1 }
        }
      })
    })

    return { success: true }
  } catch (error) {
    console.error('Failed to update menu item order:', error)
    return { success: false, error: 'Failed to update menu item order' }
  }
}
