import { getRestaurantById } from "@/actions/restaurant-actions"
import { getMenuItems } from "@/actions/menu-item-actions"
import { getItemOptions } from "@/actions/item-option-actions"
import { notFound } from "next/navigation"
import { RestaurantMenuClient } from "@/components/admin/restaurant-menu-client"

export default async function RestaurantMenuPage({ params }: { params: { restaurantId: string } }) {
  // Fetch restaurant data
  const restaurantResult = await getRestaurantById(Number.parseInt(params.restaurantId))

  if (!restaurantResult.success || !restaurantResult.data) {
    notFound()
  }

  // Fetch all menu items (we'll filter by restaurant on the client)
  const menuItemsResult = await getMenuItems()

  // Fetch all item options
  const itemOptionsResult = await getItemOptions()

  return (
    <RestaurantMenuClient
      restaurant={restaurantResult.data}
      allMenuItems={menuItemsResult.success ? menuItemsResult.data : []}
      allItemOptions={itemOptionsResult.success ? itemOptionsResult.data : []}
      restaurantId={Number.parseInt(params.restaurantId)}
    />
  )
}

