"use server"

import prisma from "@/lib/prisma"
import { serializePrismaData } from "@/lib/prisma-helpers"

// Menu Actions
export async function createMenu(data: {
  name: string
  description?: string
  restaurant_id: number
  is_active?: boolean
}) {
  try {
    const menu = await prisma.menu.create({
      data: {
        ...data,
        is_active: data.is_active ?? true
      }
    })

    const serializedMenu = serializePrismaData(menu)
    return { success: true, data: serializedMenu }
  } catch (error) {
    console.error("Failed to create menu:", error)
    return { success: false, error: "Failed to create menu" }
  }
}

export async function updateMenu(id: number, data: {
  name: string
  description?: string
  is_active?: boolean
}) {
  try {
    const menu = await prisma.menu.update({
      where: { id },
      data
    })

    const serializedMenu = serializePrismaData(menu)
    return { success: true, data: serializedMenu }
  } catch (error) {
    console.error(`Failed to update menu with ID ${id}:`, error)
    return { success: false, error: "Failed to update menu" }
  }
}

export async function deleteMenu(id: number) {
  try {
    await prisma.menu.delete({
      where: { id }
    })
    return { success: true }
  } catch (error) {
    console.error(`Failed to delete menu with ID ${id}:`, error)
    return { success: false, error: "Failed to delete menu" }
  }
}

// Category Actions
export async function createCategory(data: {
  name: string
  description?: string
  menu_id: number
  display_order?: number
}) {
  try {
    const category = await prisma.menuCategory.create({
      data: {
        ...data,
        display_order: data.display_order ?? 0
      }
    })

    const serializedCategory = serializePrismaData(category)
    return { success: true, data: serializedCategory }
  } catch (error) {
    console.error("Failed to create category:", error)
    return { success: false, error: "Failed to create category" }
  }
}

export async function updateCategory(id: number, data: {
  name: string
  description?: string
  display_order?: number
}) {
  try {
    const category = await prisma.menuCategory.update({
      where: { id },
      data
    })

    const serializedCategory = serializePrismaData(category)
    return { success: true, data: serializedCategory }
  } catch (error) {
    console.error(`Failed to update category with ID ${id}:`, error)
    return { success: false, error: "Failed to update category" }
  }
}

export async function deleteCategory(id: number) {
  try {
    await prisma.menuCategory.delete({
      where: { id }
    })
    return { success: true }
  } catch (error) {
    console.error(`Failed to delete category with ID ${id}:`, error)
    return { success: false, error: "Failed to delete category" }
  }
}

// Item Actions
export async function createMenuItem(data: {
  name: string
  description?: string
  price: number
  category_id: number
  image_url?: string
  is_available?: boolean
  display_order?: number
}) {
  try {
    const item = await prisma.menuItem.create({
      data: {
        ...data,
        is_available: data.is_available ?? true,
        display_order: data.display_order ?? 0
      }
    })

    const serializedItem = serializePrismaData(item)
    return { success: true, data: serializedItem }
  } catch (error) {
    console.error("Failed to create menu item:", error)
    return { success: false, error: "Failed to create menu item" }
  }
}

export async function updateMenuItem(id: number, data: {
  name: string
  description?: string
  price: number
  image_url?: string
  is_available?: boolean
  display_order?: number
}) {
  try {
    const item = await prisma.menuItem.update({
      where: { id },
      data
    })

    const serializedItem = serializePrismaData(item)
    return { success: true, data: serializedItem }
  } catch (error) {
    console.error(`Failed to update menu item with ID ${id}:`, error)
    return { success: false, error: "Failed to update menu item" }
  }
}

export async function deleteMenuItem(id: number) {
  try {
    await prisma.menuItem.delete({
      where: { id }
    })
    return { success: true }
  } catch (error) {
    console.error(`Failed to delete menu item with ID ${id}:`, error)
    return { success: false, error: "Failed to delete menu item" }
  }
}

// Option Actions
export async function createMenuItemOption(data: {
  name: string
  price_adjustment: number
  is_required: boolean
  menu_item_id: number
}) {
  try {
    const option = await prisma.menuItemOption.create({
      data
    })

    const serializedOption = serializePrismaData(option)
    return { success: true, data: serializedOption }
  } catch (error) {
    console.error("Failed to create menu item option:", error)
    return { success: false, error: "Failed to create menu item option" }
  }
}

export async function updateMenuItemOption(id: number, data: {
  name: string
  price_adjustment: number
  is_required: boolean
}) {
  try {
    const option = await prisma.menuItemOption.update({
      where: { id },
      data
    })

    const serializedOption = serializePrismaData(option)
    return { success: true, data: serializedOption }
  } catch (error) {
    console.error(`Failed to update menu item option with ID ${id}:`, error)
    return { success: false, error: "Failed to update menu item option" }
  }
}

export async function deleteMenuItemOption(id: number) {
  try {
    await prisma.menuItemOption.delete({
      where: { id }
    })
    return { success: true }
  } catch (error) {
    console.error(`Failed to delete menu item option with ID ${id}:`, error)
    return { success: false, error: "Failed to delete menu item option" }
  }
}

// Option Choice Actions
export async function createOptionChoice(data: {
  name: string
  price_adjustment: number
  option_id: number
}) {
  try {
    const choice = await prisma.optionChoice.create({
      data
    })

    const serializedChoice = serializePrismaData(choice)
    return { success: true, data: serializedChoice }
  } catch (error) {
    console.error("Failed to create option choice:", error)
    return { success: false, error: "Failed to create option choice" }
  }
}

export async function updateOptionChoice(id: number, data: {
  name: string
  price_adjustment: number
}) {
  try {
    const choice = await prisma.optionChoice.update({
      where: { id },
      data
    })

    const serializedChoice = serializePrismaData(choice)
    return { success: true, data: serializedChoice }
  } catch (error) {
    console.error(`Failed to update option choice with ID ${id}:`, error)
    return { success: false, error: "Failed to update option choice" }
  }
}

export async function deleteOptionChoice(id: number) {
  try {
    await prisma.optionChoice.delete({
      where: { id }
    })
    return { success: true }
  } catch (error) {
    console.error(`Failed to delete option choice with ID ${id}:`, error)
    return { success: false, error: "Failed to delete option choice" }
  }
}
