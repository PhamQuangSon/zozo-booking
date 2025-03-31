"use server"

import prisma from "@/lib/prisma"

export async function createMenuItemOption(data: {
  name: string
  priceAdjustment: number
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
  priceAdjustment: number
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