"use server"

import prisma from "@/lib/prisma"

// Menu CRUD
export async function createMenu(data: {
  name: string
  description: string | null
  restaurant_id: number
  is_active: boolean
}) {
  try {
    const menu = await prisma.menu.create({ data })
    return { success: true, data: menu }
  } catch (error) {
    console.error('Failed to create menu:', error)
    return { success: false, error: 'Failed to create menu' }
  }
}

export async function updateMenu(id: number, data: {
  name: string
  description: string | null
  is_active: boolean
}) {
  try {
    const menu = await prisma.menu.update({
      where: { id },
      data
    })
    return { success: true, data: menu }
  } catch (error) {
    console.error('Failed to update menu:', error)
    return { success: false, error: 'Failed to update menu' }
  }
}

export async function deleteMenu(id: number) {
  try {
    await prisma.menu.delete({ where: { id } })
    return { success: true }
  } catch (error) {
    console.error('Failed to delete menu:', error)
    return { success: false, error: 'Failed to delete menu' }
  }
}

// Category CRUD
export async function createCategory(data: {
  name: string
  description: string | null
  menu_id: number
  display_order: number
}) {
  try {
    const category = await prisma.menuCategory.create({ data })
    return { success: true, data: category }
  } catch (error) {
    console.error('Failed to create category:', error)
    return { success: false, error: 'Failed to create category' }
  }
}

export async function updateCategory(id: number, data: {
  name: string
  description: string | null
  display_order: number
}) {
  try {
    const category = await prisma.menuCategory.update({
      where: { id },
      data
    })
    return { success: true, data: category }
  } catch (error) {
    console.error('Failed to update category:', error)
    return { success: false, error: 'Failed to update category' }
  }
}

export async function deleteCategory(id: number) {
  try {
    await prisma.menuCategory.delete({ where: { id } })
    return { success: true }
  } catch (error) {
    console.error('Failed to delete category:', error)
    return { success: false, error: 'Failed to delete category' }
  }
}

// Menu Item CRUD
export async function createMenuItem(data: {
  name: string
  description: string | null
  price: number
  image_url: string | null
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
  image_url: string | null
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

// Menu Item Option CRUD
export async function createMenuItemOption(data: {
  name: string
  price_adjustment: number
  is_required: boolean
  menu_item_id: number
}) {
  try {
    const option = await prisma.menuItemOption.create({ data })
    return { success: true, data: option }
  } catch (error) {
    console.error('Failed to create menu item option:', error)
    return { success: false, error: 'Failed to create menu item option' }
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
    return { success: true, data: option }
  } catch (error) {
    console.error('Failed to update menu item option:', error)
    return { success: false, error: 'Failed to update menu item option' }
  }
}

export async function deleteMenuItemOption(id: number) {
  try {
    await prisma.menuItemOption.delete({ where: { id } })
    return { success: true }
  } catch (error) {
    console.error('Failed to delete menu item option:', error)
    return { success: false, error: 'Failed to delete menu item option' }
  }
}

// Option Choice CRUD
export async function createOptionChoice(data: {
  name: string
  price_adjustment: number
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
  price_adjustment: number
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
      UPDATE "MenuCategory"
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
