import { getCachedRestaurantById } from "@/lib/restaurant-cache"
import { notFound } from "next/navigation"
import { RestaurantMenuClient } from "@/components/admin/restaurant-menu-client"
import { getRestaurantById } from "@/actions/restaurant-actions"
import { use } from "react"

export default async function RestaurantMenuPage({ params }: { params: { restaurantId: string } }) {
  const { restaurantId } = params

  // Use the cached version of getRestaurantById
  const { success, data: restaurant, error } = await getCachedRestaurantById(restaurantId)
  // const { data: restaurant, success, error } = await getRestaurantById(restaurantId)

  if (!success || !restaurant) {
    notFound()
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Menu for {restaurant.name}</h1>
      <RestaurantMenuClient
        restaurant={restaurant}
        restaurantId={restaurantId}
        allMenuItems={restaurant.categories?.flatMap((c) => c.items) || []}
        allItemOptions={
          restaurant.categories?.flatMap((c) =>
            c.items?.flatMap((i) =>
              i.menuItemOptions.map(option => ({
                ...option,
                // Convert Decimal priceAdjustment in choices to number
                optionChoices: option.optionChoices.map(choice => ({
                  ...choice,
                  priceAdjustment: Number(choice.priceAdjustment) // Convert Decimal to number
                }))
              })) || []
            ) || []
          ) || []
        }
      />
    </div>
  )
}

