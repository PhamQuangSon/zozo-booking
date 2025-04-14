"use client"

import { useQuery } from "@tanstack/react-query"
import { getRestaurantById } from "@/actions/restaurant-actions"
import { getTablesByRestaurantId, getTableFullData } from "@/actions/table-actions"

// Hook for fetching restaurant data at app/restaurants/[restaurantId]/page.tsx data not order
export function useRestaurantData(restaurantId: string) {
  return useQuery({
    queryKey: ["restaurant", restaurantId],
    queryFn: async () => {
      const result = await getRestaurantById(restaurantId)
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch restaurant")
      }
      return result.data
    },
  })
}

// Hook for fetching restaurant tables
export function useRestaurantTables(restaurantId: string) {
  return useQuery({
    queryKey: ["restaurant-tables", restaurantId],
    queryFn: async () => {
      const result = await getTablesByRestaurantId(restaurantId)
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch tables")
      }
      return result.data
    },
  })
}

// Hook for fetching full table data (including menu items) att app/restaurants/[restaurantId]/[tableId]/page.tsx full has orders
export function useTableFullData(restaurantId: string, tableId: string) {
  return useQuery({
    queryKey: ["table-full-data", restaurantId, tableId],
    queryFn: async () => {
      const result = await getTableFullData(restaurantId, tableId)
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch table data")
      }
      return result.data
    },
  })
}
