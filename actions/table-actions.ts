"use server"

import prisma from "@/lib/prisma"
import { formatCurrency, type Currency } from "@/lib/i18n"

// Get table details
export async function getTableDetails(tableId: string) {
  try {
    const table = await prisma.table.findUnique({
      where: { id: Number.parseInt(tableId) },
      include: {
        restaurant: true,
      },
    })

    if (!table) { return { success: false, error: "Table not found" } }

    // Convert Decimal fields to numbers
    const formattedTable = {
      ...table,
      capacity: Number(table.capacity),
    }

    return { success: true, data: formattedTable }

  } catch (error) {
    console.error(`Failed to fetch table with ID ${tableId}:`, error)
    return { success: false, error: "Failed to load table details" }
  }
}

// Get all tables for a restaurant
export async function getRestaurantTables(restaurantId: string) {
  try {
    const tables = await prisma.table.findMany({
      where: {
        restaurant_id: Number.parseInt(restaurantId),
      },
      orderBy: {
        number: "asc",
      },
    })

    // Convert Decimal fields to numbers
    const formattedTables = tables.map((table) => ({
      ...table,
      capacity: Number(table.capacity),
    }))

    return { success: true, data: formattedTables }
  } catch (error) {
    console.error(`Failed to fetch tables for restaurant ${restaurantId}:`, error)
    return { success: false, error: "Failed to load tables" }
  }
}

// Create a new table
export async function createTable(data: {
  restaurant_id: number
  number: number
  capacity: number
  status?: string
  image_url?: string
}) {
  try {
    // Check if table number already exists for this restaurant
    const existingTable = await prisma.table.findFirst({
      where: {
        restaurant_id: data.restaurant_id,
        number: data.number,
      },
    })

    if (existingTable) {
      return { success: false, error: "A table with this number already exists for this restaurant" }
    }

    const table = await prisma.table.create({
      data: {
        restaurant_id: data.restaurant_id,
        number: data.number,
        capacity: data.capacity,
        status: (data.status as any) || "AVAILABLE",
        image_url: data.image_url,
      },
    })

    // Convert Decimal fields to numbers
    const formattedTable = {
      ...table,
      capacity: Number(table.capacity),
    }

    return { success: true, data: formattedTable }
  } catch (error) {
    console.error("Failed to create table:", error)
    return { success: false, error: "Failed to create table" }
  }
}

// Update a table
export async function updateTable(
  id: number,
  data: {
    number: number
    capacity: number
    status?: string
    restaurant_id: number
    image_url?: string
  },
) {
  try {
    // Check if table number already exists for this restaurant (excluding this table)
    const existingTable = await prisma.table.findFirst({
      where: {
        restaurant_id: data.restaurant_id,
        number: data.number,
        id: { not: id },
      },
    })

    if (existingTable) {
      return { success: false, error: "A table with this number already exists for this restaurant" }
    }

    const table = await prisma.table.update({
      where: { id },
      data: {
        number: data.number,
        capacity: data.capacity,
        status: (data.status as any) || "AVAILABLE",
        image_url: data.image_url,
      },
    })

    // Convert Decimal fields to numbers
    const formattedTable = {
      ...table,
      capacity: Number(table.capacity),
    }

    return { success: true, data: formattedTable }
  } catch (error) {
    console.error(`Failed to update table with ID ${id}:`, error)
    return { success: false, error: "Failed to update table" }
  }
}

// Delete a table
export async function deleteTable(id: number) {
  try {
    await prisma.table.delete({
      where: { id },
    })

    return { success: true }
  } catch (error) {
    console.error(`Failed to delete table with ID ${id}:`, error)
    return { success: false, error: "Failed to delete table" }
  }
}

// Get menu for a specific table
export async function getMenuForTable(restaurantId: string, tableId: string) {
  try {
    // First verify the table exists and belongs to the restaurant
    const table = await prisma.table.findFirst({
      where: {
        id: Number.parseInt(tableId),
        restaurant_id: Number.parseInt(restaurantId),
      },
    })

    if (!table) {
      return { success: false, error: "Table not found or does not belong to this restaurant" }
    }

    // Get the active menu for the restaurant
    const menu = await prisma.menu.findFirst({
      where: {
        restaurant_id: Number.parseInt(restaurantId),
        is_active: true,
      },
      include: {
        menu_categories: {
          orderBy: { display_order: "asc" },
          include: {
            menu_items: {
              where: { is_available: true },
              orderBy: { display_order: "asc" },
              include: {
                menu_item_options: {
                  include: {
                    option_choices: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!menu) {
      return { success: false, error: "No active menu found for this restaurant" }
    }

    // Convert Decimal fields to numbers
    const formattedMenu = {
      ...menu,
      menu_categories: menu.menu_categories.map((category) => ({
        ...category,
        display_order: Number(category.display_order),
        menu_items: category.menu_items.map((item) => ({
          ...item,
          price: Number(item.price),
          display_order: Number(item.display_order),
        })),
      })),
    }

    return { success: true, data: { table, menu } }
  } catch (error) {
    console.error(`Failed to fetch menu for table ${tableId} at restaurant ${restaurantId}:`, error)
    return { success: false, error: "Failed to load menu" }
  }
}

// Format menu items with proper currency
export async function formatTableMenuItems(menuCategories: any[], currency: Currency) {
  return menuCategories.map((category) => ({
    ...category,
    menu_items: category.menu_items.map((item: any) => ({
      ...item,
      formattedPrice: formatCurrency(item.price, currency),
      price: Number(item.price),
      menu_item_options: item.menu_item_options.map((option: any) => ({
        ...option,
        option_choices: option.option_choices.map((choice: any) => ({
          
          ...choice,
          formattedPriceAdjustment: formatCurrency(choice.price_adjustment, currency),
          price_adjustment: Number(choice.price_adjustment),
        })),
      })),
    })),
  }))
}

// Create a table order
export async function createTableOrder(data: {
  restaurantId: number
  tableId: number
  items: Array<{
    menuItemId: number
    quantity: number
    notes?: string
    choices?: Array<{
      optionId: number
      choiceId: number
    }>
  }>
  notes?: string
}) {
  try {
    // First, verify the table exists and belongs to the restaurant
    const table = await prisma.table.findFirst({
      where: {
        id: data.tableId,
        restaurant_id: data.restaurantId,
      },
    })

    if (!table) {
      return { success: false, error: "Table not found or does not belong to this restaurant" }
    }

    // Calculate total amount and create the order
    let totalAmount = 0

    // Get all menu items to calculate prices
    const menuItemIds = data.items.map((item) => item.menuItemId)
    const menuItems = await prisma.menuItem.findMany({
      where: { id: { in: menuItemIds } },
      include: {
        menu_item_options: {
          include: {
            option_choices: true,
          },
        },
      },
    })

    // Calculate total amount
    for (const orderItem of data.items) {
      const menuItem = menuItems.find((item) => item.id === orderItem.menuItemId)
      if (!menuItem) continue

      let itemPrice = Number(menuItem.price)

      // Add price adjustments for choices if any
      if (orderItem.choices && orderItem.choices.length > 0) {
        for (const choice of orderItem.choices) {
          const option = menuItem.menu_item_options.find((opt) => opt.id === choice.optionId)
          if (!option) continue

          const selectedChoice = option.option_choices.find((ch) => ch.id === choice.choiceId)
          if (selectedChoice) {
            itemPrice += Number(selectedChoice.price_adjustment)
          }
        }
      }

      totalAmount += itemPrice * orderItem.quantity
    }

    // Create the order
    const order = await prisma.order.create({
      data: {
        restaurant_id: data.restaurantId,
        table_id: data.tableId,
        status: "NEW",
        total_amount: totalAmount,
        notes: data.notes,
        order_items: {
          create: data.items.map((item) => {
            const menuItem = menuItems.find((mi) => mi.id === item.menuItemId)
            return {
              menu_item_id: item.menuItemId,
              quantity: item.quantity,
              unit_price: menuItem?.price || 0,
              notes: item.notes,
              order_item_choices: item.choices
                ? {
                    create: item.choices.map((choice) => ({
                      option_id: choice.optionId,
                      choice_id: choice.choiceId,
                    })),
                  }
                : undefined,
            }
          }),
        },
      },
      include: {
        order_items: {
          include: {
            menu_item: true,
            order_item_choices: {
              include: {
                option_choice: true,
                menu_item_option: true,
              },
            },
          },
        },
      },
    })

    // Update table status to occupied
    await prisma.table.update({
      where: { id: data.tableId },
      data: { status: "OCCUPIED" },
    })

    // Convert Decimal fields to numbers
    const formattedOrder = {
      ...order,
      total_amount: Number(order.total_amount),
    }

    return { success: true, data: formattedOrder }
  } catch (error) {
    console.error("Failed to create table order:", error)
    return { success: false, error: "Failed to create order" }
  }
}
