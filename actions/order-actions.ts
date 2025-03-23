"use server"

import prisma from "@/lib/db"

// Get orders for a restaurant
export async function getRestaurantOrders(restaurantId: string) {
  try {
    const orders = await prisma.orders.findMany({
      where: {
        restaurant_id: Number.parseInt(restaurantId),
      },
      include: {
        restaurant_tables: true,
        users: {
          select: {
            name: true,
            email: true,
          },
        },
        order_items: {
          include: {
            menu_items: true,
            order_item_choices: {
              include: {
                option_choices: true,
                menu_item_options: true,
              },
            },
          },
        },
      },
      orderBy: { created_at: "desc" },
    })

    return { success: true, data: orders }
  } catch (error) {
    console.error("Failed to fetch orders:", error)
    return { success: false, error: "Failed to load orders" }
  }
}

// Create a new order
export async function createOrder(data: {
  restaurantId: number
  tableId?: number
  userId?: number
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
    // First, calculate the total amount based on menu items and choices
    let totalAmount = 0

    // Get all menu items to calculate prices
    const menuItemIds = data.items.map((item) => item.menuItemId)
    const menuItems = await prisma.menu_items.findMany({
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
    const order = await prisma.orders.create({
      data: {
        restaurant_id: data.restaurantId,
        table_id: data.tableId,
        user_id: data.userId,
        status: "pending",
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
            menu_items: true,
            order_item_choices: {
              include: {
                option_choices: true,
                menu_item_options: true,
              },
            },
          },
        },
      },
    })

    return { success: true, data: order }
  } catch (error) {
    console.error("Failed to create order:", error)
    return { success: false, error: "Failed to create order" }
  }
}

// Update order status
export async function updateOrderStatus(orderId: number, status: string) {
  try {
    const order = await prisma.orders.update({
      where: { id: orderId },
      data: { status },
    })

    return { success: true, data: order }
  } catch (error) {
    console.error("Failed to update order status:", error)
    return { success: false, error: "Failed to update order status" }
  }
}

