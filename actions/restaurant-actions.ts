"use server"

import prisma from "@/lib/prisma"
import { formatCurrency, type Currency } from "@/lib/i18n"
import { serializePrismaData } from "@/lib/prisma-helpers"

// Get all restaurants
export async function getRestaurants() {
  try {
    const restaurants = await prisma.restaurant.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        imageUrl: true,
        address: true,
        phone: true,
        email: true,
        cuisine: true,
      },
    })

    return { success: true, data: serializePrismaData(restaurants) }
  } catch (error) {
    console.error("Failed to fetch restaurants:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to load restaurants",
    }
  }
}

// Get restaurant by ID with categories, menu items, and item options
export async function getRestaurantById(id: number) {
  try {
    const restaurant = await prisma.restaurant.findUnique({
      where: { id },
      include: {
        categories: {
          orderBy: {
            displayOrder: "asc",
          },
        },
      },
    })

    if (!restaurant) {
      return { success: false, error: "Restaurant not found" }
    }

    return { success: true, data: serializePrismaData(restaurant) }
  } catch (error) {
    console.error("Failed to fetch restaurant:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to load restaurant",
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
  imageUrl?: string
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
        imageUrl: data.imageUrl,
        cuisine: data.cuisine,
      },
    })

    return { success: true, data: serializePrismaData(restaurant) }
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
    imageUrl?: string
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
        imageUrl: data.imageUrl,
        cuisine: data.cuisine,
      },
    })

    return { success: true, data: serializePrismaData(restaurant) }
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
export async function formatMenuItems(menuItems: any[], currency: Currency = "USD") {
  if (!menuItems || !Array.isArray(menuItems)) return []

  // First serialize any Decimal values
  const serializedItems = serializePrismaData(menuItems)

  // Then format the prices
  return serializedItems.map((item) => ({
    ...item,
    formattedPrice: formatCurrency(item.price || 0, currency),
  }))
}

// Add a new function for formatting item options
export async function formatItemOptions(itemOptions: any[], currency: Currency = "USD") {
  if (!itemOptions || !Array.isArray(itemOptions)) return []

  // First serialize any Decimal values
  const serializedOptions = serializePrismaData(itemOptions)

  // Then format the prices for options and their choices
  return serializedOptions.map((option) => {
    const formattedOption = {
      ...option,
      formattedPriceAdjustment: formatCurrency(option.priceAdjustment || 0, currency),
    }

    if (option.optionChoices && Array.isArray(option.optionChoices)) {
      formattedOption.optionChoices = option.optionChoices.map((choice: any) => ({
        ...choice,
        formattedPriceAdjustment: formatCurrency(choice.priceAdjustment || 0, currency),
      }))
    } else {
      formattedOption.optionChoices = []
    }

    return formattedOption
  })
}
