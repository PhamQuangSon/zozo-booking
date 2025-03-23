"use server"

import prisma from "@/lib/prisma"

// Get all menu items for a restaurant
export async function getMenuItems(restaurantId: string) {
  try {
    const menuItems = await prisma.menuItem.findMany({
      where: {
        menu_categories: {
          menu: {
            restaurant_id: Number.parseInt(restaurantId),
            is_active: true,
          },
        },
      },
      include: {
        menu_categories: {
          include: {
            menu: true,
          },
        },
        menu_item_options: {
          include: {
            option_choices: true,
          },
        },
      },
    })

    return { success: true, data: menuItems }
  } catch (error) {
    console.error("Failed to fetch menu items:", error)
    return { success: false, error: "Failed to load menu items" }
  }
}

// Create a new menu item
export async function createMenuItem(data: {
  categoryId: number
  name: string
  description?: string
  price: number
  imageUrl?: string
  isAvailable?: boolean
  displayOrder?: number
  options?: Array<{
    name: string
    priceAdjustment: number
    isRequired?: boolean
    choices?: Array<{
      name: string
      priceAdjustment: number
    }>
  }>
}) {
  try {
    const menuItem = await prisma.menuItem.create({
      data: {
        category_id: data.categoryId,
        name: data.name,
        description: data.description,
        price: data.price,
        image_url: data.imageUrl,
        is_available: data.isAvailable ?? true,
        display_order: data.displayOrder ?? 0,
        menu_item_options: data.options
          ? {
              create: data.options.map((option) => ({
                name: option.name,
                price_adjustment: option.priceAdjustment,
                isRequired: option.isRequired ?? false,
                option_choices: option.choices
                  ? {
                      create: option.choices.map((choice) => ({
                        name: choice.name,
                        price_adjustment: choice.priceAdjustment,
                      })),
                    }
                  : undefined,
              })),
            }
          : undefined,
      },
      include: {
        menu_item_options: {
          include: {
            option_choices: true,
          },
        },
      },
    })

    return { success: true, data: menuItem }
  } catch (error) {
    console.error("Failed to create menu item:", error)
    return { success: false, error: "Failed to create menu item" }
  }
}

// Get all categories for a restaurant
export async function getmenu_categories(restaurantId: string) {
  try {
    const categories = await prisma.menuCategory.findMany({
      where: {
        menu: {
          restaurant_id: Number.parseInt(restaurantId),
          is_active: true,
        },
      },
      include: {
        menu: true,
      },
      orderBy: {
        display_order: "asc",
      },
    })

    return { success: true, data: categories }
  } catch (error) {
    console.error("Failed to fetch menu categories:", error)
    return { success: false, error: "Failed to load menu categories" }
  }
}

// Create a new category
export async function createMenuCategory(data: {
  menuId: number
  name: string
  description?: string
  displayOrder?: number
}) {
  try {
    const category = await prisma.menuCategory.create({
      data: {
        menu_id: data.menuId,
        name: data.name,
        description: data.description,
        display_order: data.displayOrder ?? 0,
      },
    })

    return { success: true, data: category }
  } catch (error) {
    console.error("Failed to create menu category:", error)
    return { success: false, error: "Failed to create menu category" }
  }
}

