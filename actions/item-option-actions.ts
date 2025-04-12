"use server"

import prisma from "@/lib/prisma"
import { serializePrismaData } from "@/lib/prisma-helpers"
import { revalidatePath } from "next/cache"
import type { ItemOptionFormValues } from "@/schemas/item-option-schema"

// Get all item options
export async function getItemOptions() {
  try {
    const itemOptions = await prisma.menuItemOption.findMany({
      include: {
        menuItem: {
          include: {
            restaurant: true,
            category: true,
          },
        },
        optionChoices: true,
      },
      orderBy: {
        menuItem: {
          name: "asc",
        },
      },
    })

    return { success: true, data: serializePrismaData(itemOptions) }
  } catch (error) {
    console.error("Failed to fetch item options:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to load item options",
      data: [],
    }
  }
}

// Get menu items for options
export async function getMenuItemsForOptions() {
  try {
    const menuItems = await prisma.menuItem.findMany({
      include: {
        restaurant: true,
      },
      orderBy: {
        restaurant: {
          name: "asc",
        },
      },
    })

    return { success: true, data: serializePrismaData(menuItems) }
  } catch (error) {
    console.error("Failed to fetch menu items:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to load menu items",
      data: [],
    }
  }
}

// Item Option CRUD
export async function createItemOption(data: ItemOptionFormValues) {
  try {
    // Create the menu item option
    const itemOption = await prisma.menuItemOption.create({
      data: {
        name: data.name,
        isRequired: data.isRequired,
        priceAdjustment: 0, // Base price adjustment is 0
        menuItemId: data.menuItemId,
        // We'll create the option choices separately
      },
    })

    // Create the option choices
    if (Array.isArray(data.optionChoices)) {
      for (const choice of data.optionChoices) {
        if (choice.name) {
          // Only create choices with names
          await prisma.optionChoice.create({
            data: {
              name: choice.name,
              priceAdjustment: parseFloat(choice.priceAdjustment.toFixed(2)) || 0,
              menuItemOptionId: itemOption.id,
            },
          })
        }
      }
    }

    revalidatePath("/admin/item-options")
    return { success: true, data: itemOption }
  } catch (error) {
    console.error("Failed to create item option:", error)
    return { success: false, error: "Failed to create item option" }
  }
}

export async function updateItemOption(id: number, data: ItemOptionFormValues) {
  try {
    // Update the menu item option
    const itemOption = await prisma.menuItemOption.update({
      where: { id },
      data: {
        name: data.name,
        isRequired: data.isRequired,
        menuItemId: data.menuItemId,
      },
    })

    // Get existing option choices
    const existingChoices = await prisma.optionChoice.findMany({
      where: { menuItemOptionId: id },
    })

    // Create a map of existing choices by ID for quick lookup
    const existingChoicesMap = new Map(existingChoices.map((choice) => [choice.id, choice]))

    // Process each option choice
    if (Array.isArray(data.optionChoices)) {
      for (const choice of data.optionChoices) {
        if (choice.id) {
          // Update existing choice
          await prisma.optionChoice.update({
            where: { id: choice.id },
            data: {
              name: choice.name,
              priceAdjustment: parseFloat(choice.priceAdjustment.toFixed(2)) || 0,
            },
          })
          // Remove from map to track which ones were processed
          existingChoicesMap.delete(choice.id)
        } else if (choice.name) {
          // Create new choice (only if it has a name)
          await prisma.optionChoice.create({
            data: {
              name: choice.name,
              priceAdjustment: parseFloat(choice.priceAdjustment.toFixed(2)) || 0,
              menuItemOptionId: id,
            },
          })
        }
      }
    }

    // Delete any choices that weren't in the update data
    for (const [choiceId] of existingChoicesMap) {
      await prisma.optionChoice.delete({
        where: { id: choiceId },
      })
    }

    revalidatePath("/admin/item-options")
    return { success: true, data: itemOption }
  } catch (error) {
    console.error("Failed to update item option:", error)
    return { success: false, error: "Failed to update item option" }
  }
}

export async function deleteItemOption(id: number) {
  try {
    // Delete all associated option choices first
    await prisma.optionChoice.deleteMany({
      where: { menuItemOptionId: id },
    })

    // Then delete the menu item option
    await prisma.menuItemOption.delete({
      where: { id },
    })

    revalidatePath("/admin/item-options")
    return { success: true }
  } catch (error) {
    console.error("Failed to delete item option:", error)
    return { success: false, error: "Failed to delete item option" }
  }
}
