"use server"

import prisma from "@/lib/prisma"
import { serializePrismaData } from "@/lib/prisma-helpers"
import { formatCurrency, type Currency } from "@/lib/i18n"
import { auth } from "@/config/auth"

// Get table details
export async function getTableDetails(tableId: string) {
  try {
    const table = await prisma.table.findUnique({
      where: { id: Number.parseInt(tableId) },
      include: {
        restaurant: true,
      },
    })

    if (!table) {
      return { success: false, error: "Table not found" }
    }

    const serializedTable = serializePrismaData(table)

    return { success: true, data: serializedTable }
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
        restaurantId: Number.parseInt(restaurantId),
      },
      orderBy: {
        number: "asc",
      },
    })

    const serializedTables = serializePrismaData(tables)

    return { success: true, data: serializedTables }
  } catch (error) {
    console.error(`Failed to fetch tables for restaurant ${restaurantId}:`, error)
    return { success: false, error: "Failed to load tables" }
  }
}

// Add this function to get tables by restaurant ID
export async function getTablesByRestaurantId(restaurantId: string) {
  try {
    const tables = await prisma.table.findMany({
      where: {
        restaurantId: Number.parseInt(restaurantId),
      },
      orderBy: {
        number: "asc",
      },
    })

    return serializePrismaData(tables)
  } catch (error) {
    console.error(`Failed to fetch tables for restaurant ${restaurantId}:`, error)
    return []
  }
}

// Create a new table
export async function createTable(data: {
  restaurantId: number
  number: number
  capacity: number
  status?: string
  imageUrl?: string
}) {
  try {
    // Check if table number already exists for this restaurant
    const existingTable = await prisma.table.findFirst({
      where: {
        restaurantId: data.restaurantId,
        number: data.number,
      },
    })

    if (existingTable) {
      return { success: false, error: "A table with this number already exists for this restaurant" }
    }

    const table = await prisma.table.create({
      data: {
        restaurantId: data.restaurantId,
        number: data.number,
        capacity: data.capacity,
        status: (data.status as any) || "AVAILABLE",
        imageUrl: data.imageUrl,
      },
    })

    const serializedTable = serializePrismaData(table)

    return { success: true, data: serializedTable }
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
    restaurantId: number
    imageUrl?: string
  },
) {
  try {
    // Check if table number already exists for this restaurant (excluding this table)
    const existingTable = await prisma.table.findFirst({
      where: {
        restaurantId: data.restaurantId,
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
        imageUrl: data.imageUrl,
      },
    })

    const serializedTable = serializePrismaData(table)

    return { success: true, data: serializedTable }
  } catch (error) {
    console.error(`Failed to update table with ID ${id}:`, error)
    return { success: false, error: "Failed to update table" }
  }
}

export async function getTableOrders(restaurantId: string, tableId: string) {
  try {
    const orders = await prisma.order.findMany({
      where: {
        restaurantId: Number(restaurantId),
        tableId: Number(tableId),
        status: { notIn: ["COMPLETED", "CANCELLED"] },
      },
      include: {
        orderItems: {
          include: {
            menuItem: true,
            orderItemChoices: {
              include: {
                optionChoice: true,
                menuItemOption: true,
              },
            },
          },
        },
      },
    })

    return { success: true, data: serializePrismaData(orders) }
  } catch (error) {
    console.error("Failed to fetch orders:", error)
    return { success: false, error: "Failed to load orders" }
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

// Format menu items with proper currency
export async function formatTableMenuItems(menuCategories: any[], currency: Currency) {
  return menuCategories.map((category) => ({
    ...category,
    menu_items: category.menu_items.map((item: any) => ({
      ...item,
      formattedPrice: formatCurrency(item.price, currency),
      price: Number(item.price),
      menuItemOptions: item.menuItemOptions.map((option: any) => ({
        ...option,
        optionChoices: option.optionChoices.map((choice: any) => ({
          ...choice,
          formattedPriceAdjustment: formatCurrency(choice.priceAdjustment, currency),
          priceAdjustment: Number(choice.priceAdjustment),
        })),
      })),
    })),
  }))
}

// Create a table order
export async function createTableOrder(data: {
  restaurantId: number
  tableId: number
  customerName?: string
  customerEmail?: string
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
        restaurantId: data.restaurantId,
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
        menuItemOptions: {
          include: {
            optionChoices: true,
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
          const option = menuItem.menuItemOptions.find((opt) => opt.id === choice.optionId)
          if (!option) continue

          const selectedChoice = option.optionChoices.find((ch) => ch.id === choice.choiceId)
          if (selectedChoice) {
            itemPrice += Number(selectedChoice.priceAdjustment)
          }
        }
      }

      totalAmount += itemPrice * orderItem.quantity
    }

    // Get current user if authenticated
    const session = await auth()
    const userId = session?.user?.id

    // Prepare notes with customer info if provided and user is not authenticated
    let orderNotes = data.notes || ""
    if (!userId && data.customerName && data.customerEmail) {
      orderNotes = `Customer Info: ${data.customerName} (${data.customerEmail})\n\n${orderNotes}`.trim()
    }

    // Create the order
    const order = await prisma.order.create({
      data: {
        restaurantId: data.restaurantId,
        tableId: data.tableId,
        userId: userId,
        status: "NEW",
        totalAmount: totalAmount,
        notes: orderNotes,
        orderItems: {
          create: data.items.map((item) => {
            const menuItem = menuItems.find((mi) => mi.id === item.menuItemId)
            return {
              menuItemId: item.menuItemId,
              quantity: item.quantity,
              unitPrice: menuItem?.price || 0,
              notes: item.notes,
              status: "NEW",
              orderItemChoices: item.choices
                ? {
                    create: item.choices.map((choice) => ({
                      menuItemOptionId: choice.optionId,
                      optionChoiceId: choice.choiceId,
                    })),
                  }
                : undefined,
            }
          }),
        },
      },
      include: {
        orderItems: {
          include: {
            orderItemChoices: {
              include: {
                optionChoice: true,
                menuItemOption: true,
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

    const serializedOrder = serializePrismaData(order)

    return { success: true, data: serializedOrder }
  } catch (error) {
    console.error("Failed to create table order:", error)
    return { success: false, error: "Failed to create order" }
  }
}

// Get all table data including restaurant, menu items, options, and active orders in one call
export async function getTableFullData(restaurantId: string, tableId: string) {
  try {
    // Get table data
    const table = await prisma.table.findUnique({
      where: { id: Number(tableId) },
    })

    if (!table) {
      return { success: false, error: "Table not found" }
    }

    // Get restaurant with all menu data
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: Number(restaurantId) },
      include: {
        categories: {
          orderBy: {
            displayOrder: "asc",
          },
          include: {
            items: {
              orderBy: {
                displayOrder: "asc",
              },
              include: {
                menuItemOptions: {
                  include: {
                    optionChoices: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!restaurant) {
      return { success: false, error: "Restaurant not found" }
    }

    // Get active orders for this table
    const orders = await prisma.order.findMany({
      where: {
        restaurantId: Number(restaurantId),
        tableId: Number(tableId),
        status: { notIn: ["COMPLETED", "CANCELLED"] },
      },
      include: {
        orderItems: {
          include: {
            menuItem: true,
            orderItemChoices: {
              include: {
                optionChoice: true,
                menuItemOption: true,
              },
            },
          },
        },
      },
    })

    // Return all data in one response
    return {
      success: true,
      data: serializePrismaData({
        table,
        restaurant,
        orders,
      }),
    }
  } catch (error) {
    console.error("Failed to fetch table data:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to load table data",
    }
  }
}
