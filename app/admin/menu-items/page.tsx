import { getMenuItems } from "@/actions/menu-item-actions"
import { MenuItemsClient } from "@/components/admin/menu-items-client"
import type { MenuItem, Category, Restaurant } from "@prisma/client"

// Define the extended MenuItem type with relations
type MenuItemWithRelations = MenuItem & {
  category: Category
  restaurant: Restaurant
}

export default async function MenuItemsPage() {
  const { data: menuItems = [], success } = await getMenuItems()

  if (!success) {
    return <div>Failed to load menu items</div>
  }

  // Prepare data for client component without functions
  const preparedMenuItems = menuItems.map((item) => ({
    ...item,
    // Pre-format any data needed by the client
    formattedPrice: item.price ? `$${Number.parseFloat(item.price.toString()).toFixed(2)}` : "$0.00",
    categoryName: item.category?.name || "No Category",
    restaurantName: item.restaurant?.name || "No Restaurant",
  }))

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Menu Items</h1>
      <MenuItemsClient menuItems={preparedMenuItems} />
    </div>
  )
}

