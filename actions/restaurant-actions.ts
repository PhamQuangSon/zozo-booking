"use server"

import prisma from "@/lib/prisma"
import { formatCurrency, type Currency } from "@/lib/i18n"

// Get all restaurants
export async function getRestaurants() {
  try {
    const restaurants = await prisma.restaurant.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        image_url: true,
        address: true,
        phone: true,
        email: true,
        cuisine: true,
      },
    })

    return { success: true, data: restaurants }
  } catch (error) {
    console.error("Failed to fetch restaurants:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to load restaurants",
    }
  }
}

// Get restaurant by ID
export async function getRestaurantById(id: string) {
  try {
    const parsedId = Number.parseInt(id)
    if (isNaN(parsedId)) {
      return { success: false, error: "Invalid restaurant ID" }
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: parsedId },
      include: {
        menus: {
          where: { is_active: true },
          include: {
            menu_categories: {
              orderBy: { display_order: "asc" },
              include: {
                menu_items: {
                  where: { is_available: true },
                  orderBy: { display_order: "asc" },
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

    // Convert Decimal fields to numbers
    const formattedRestaurant = {
      ...restaurant,
      menus: restaurant.menus.map((menu) => ({
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
        
      })),
    }
    return { success: true, data: formattedRestaurant }
  } catch (error) {
    console.error(`Failed to fetch restaurant with ID ${id}:`, error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to load restaurant details",
    }
  }
}

// Create a new restaurant
export async function createRestaurant(data: {
  name: string
  description?: string
  address?: string
  phone?: string
  email?: string
  image_url?: string
  cuisine?: string
}) {
  try {
    const restaurant = await prisma.restaurant.create({
      data: {
        name: data.name,
        description: data.description,
        address: data.address,
        phone: data.phone,
        email: data.email,
        image_url: data.image_url,
        cuisine: data.cuisine,
      },
    })

    return { success: true, data: restaurant }
  } catch (error) {
    console.error("Failed to create restaurant:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create restaurant",
    }
  }
}

// Update a restaurant
export async function updateRestaurant(
  id: number,
  data: {
    name: string
    description?: string
    address?: string
    phone?: string
    email?: string
    image_url?: string
    cuisine?: string
  },
) {
  try {
    const restaurant = await prisma.restaurant.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        address: data.address,
        phone: data.phone,
        email: data.email,
        image_url: data.image_url,
        cuisine: data.cuisine,
      },
    })

    return { success: true, data: restaurant }
  } catch (error) {
    console.error(`Failed to update restaurant with ID ${id}:`, error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update restaurant",
    }
  }
}

// Delete a restaurant
export async function deleteRestaurant(id: number) {
  try {
    await prisma.restaurant.delete({
      where: { id },
    })

    return { success: true }
  } catch (error) {
    console.error(`Failed to delete restaurant with ID ${id}:`, error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete restaurant",
    }
  }
}

// Format menu items with proper currency
export async function formatMenuItems(menuItems: any[], currency: Currency) {
  return menuItems.map((item) => ({
    ...item,
    formattedPrice: formatCurrency(item.price, currency),
    price: Number(item.price), // Ensure price is a number for calculations
  }))
}
