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

    // Convert Decimal to number
    const formattedMenuItems = menuItems.map((item) => ({
      ...item,
      price: Number(item.price), // Convert price to number
      menu_item_options: item.menu_item_options.map((option) => ({
        ...option,
        price_adjustment: Number(option.price_adjustment), // Convert price_adjustment to number
        option_choices: option.option_choices.map((choice) => ({
          ...choice,
          price_adjustment: Number(choice.price_adjustment), // Convert price_adjustment to number
        })),
      })),
    }))

    return { success: true, data: formattedMenuItems }
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

    // Convert Decimal to number
    const formattedMenuItem = {
      ...menuItem,
      price: Number(menuItem.price), // Convert price to number
      menu_item_options: menuItem.menu_item_options.map((option) => ({
        ...option,
        price_adjustment: Number(option.price_adjustment), // Convert price_adjustment to number
        option_choices: option.option_choices.map((choice) => ({
          ...choice,
          price_adjustment: Number(choice.price_adjustment), // Convert price_adjustment to number
        })),
      })),
    }

    return { success: true, data: formattedMenuItem }
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

    // Convert Decimal fields to numbers
    const formattedCategories = categories.map((category) => ({
      ...category,
      display_order: Number(category.display_order), // Convert display_order to number
    }))

    return { success: true, data: formattedCategories }
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

    // Convert Decimal fields to numbers
    const formattedCategory = {
      ...category,
      display_order: Number(category.display_order), // Convert display_order to number
    }

    return { success: true, data: formattedCategory }
  } catch (error) {
    console.error("Failed to create menu category:", error)
    return { success: false, error: "Failed to create menu category" }
  }
}

