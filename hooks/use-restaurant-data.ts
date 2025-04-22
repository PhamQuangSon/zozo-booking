"use client";

import { getRestaurantById } from "@/actions/restaurant-actions";
import {
  getTableFullData,
  getTablesByRestaurantId,
} from "@/actions/table-actions";
import { useQuery } from "@tanstack/react-query";

// Hook for fetching restaurant data at app/restaurants/[restaurantId]/page.tsx data not order
export function useRestaurantData(restaurantId: string) {
  return useQuery({
    queryKey: ["restaurant", restaurantId],
    queryFn: async () => {
      const result = await getRestaurantById(restaurantId);
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch restaurant");
      }
      return result.data;
    },
  });
}

// Hook for fetching restaurant tables
export function useRestaurantTables(restaurantId: string) {
  return useQuery({
    queryKey: ["restaurant-tables", restaurantId],
    queryFn: async () => {
      const result = await getTablesByRestaurantId(restaurantId);
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch tables");
      }
      return result.data;
    },
  });
}

// Hook for fetching full table data (including menu items) att app/restaurants/[restaurantId]/[tableId]/page.tsx full has orders
// and cart
// This is used in the table page to get the full data for a specific table
export function useTableFullData(restaurantId: string, tableId: string) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["tableData", restaurantId, tableId],
    queryFn: async () => {
      const result = await getTableFullData(restaurantId, tableId);
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch table data");
      }
      return result.data;
    },
    staleTime: 30000, // Data is considered fresh for 30 seconds
    refetchOnWindowFocus: true,
    refetchInterval: 60000 * 5, // Refetch every minute
  });

  return {
    data,
    isLoading,
    error,
    refetch,
  };
}
