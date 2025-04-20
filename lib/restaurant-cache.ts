import { cache } from "react";

import { getRestaurantById } from "@/actions/restaurant-actions";

// Create a cached version of getRestaurantById
export const getCachedRestaurantById = cache(async (id: string) => {
  console.log(`Fetching restaurant data for ID: ${id} (will be cached)`);
  return getRestaurantById(id);
});
