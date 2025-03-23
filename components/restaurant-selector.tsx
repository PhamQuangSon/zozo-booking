"use client"

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Store } from "lucide-react"

interface Restaurant {
  id: string
  name: string
}

// Create a custom event for restaurant changes
export const RESTAURANT_CHANGE_EVENT = "restaurant-change"

export function RestaurantSelector() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>("")

  useEffect(() => {
    // Fetch restaurants - in a real app, this would be an API call
    const fetchRestaurants = async () => {
      // Mock data based on seed.ts
      const mockRestaurants = [
        { id: "1", name: "Pasta Paradise" },
        { id: "2", name: "Sushi Sensation" },
      ]
      setRestaurants(mockRestaurants)

      // Check if we have a saved default restaurant
      const savedRestaurant = localStorage.getItem("defaultRestaurant")
      if (savedRestaurant) {
        try {
          const parsed = JSON.parse(savedRestaurant)
          setSelectedRestaurant(parsed.id)
        } catch (e) {
          console.error("Failed to parse saved restaurant:", e)
          // Set first restaurant as default if parsing fails
          if (mockRestaurants.length > 0) {
            setSelectedRestaurant(mockRestaurants[0].id)
          }
        }
      } else if (mockRestaurants.length > 0) {
        // Set first restaurant as default if none is saved
        setSelectedRestaurant(mockRestaurants[0].id)
      }
    }

    fetchRestaurants()
  }, [])

  const handleRestaurantChange = (value: string) => {
    setSelectedRestaurant(value)

    // Find the selected restaurant
    const restaurant = restaurants.find((r) => r.id === value)
    if (restaurant) {
      // Save to localStorage
      localStorage.setItem("defaultRestaurant", JSON.stringify(restaurant))

      // Dispatch a custom event to notify other components
      const event = new CustomEvent(RESTAURANT_CHANGE_EVENT, {
        detail: restaurant,
      })
      window.dispatchEvent(event)
    }
  }

  return (
    <Select value={selectedRestaurant} onValueChange={handleRestaurantChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select restaurant" />
      </SelectTrigger>
      <SelectContent>
        {restaurants.map((restaurant) => (
          <SelectItem key={restaurant.id} value={restaurant.id}>
            <div className="flex items-center gap-2">
              <Store className="h-4 w-4 text-muted-foreground" />
              {restaurant.name}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

