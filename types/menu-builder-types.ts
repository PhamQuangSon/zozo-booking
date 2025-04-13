import type { Restaurant, MenuItem, MenuItemOption, Category, OptionChoice, Order, OrderItem,OrderItemChoice, Table,  } from "@prisma/client"
import type { Decimal } from "@prisma/client/runtime/library"

// Base types from Prisma might not include relations automatically
// Define types with expected relations for easier use

export type RestaurantWithCategories = Restaurant & {
  categories: (Category & {
    items: (MenuItem & {
      menuItemOptions: MenuItemOption[]
    })[]
  })[]
}

export type MenuItemWithRelations = MenuItem & {
  category: Category
  restaurant: Restaurant
  menuItemOptions: MenuItemOption[]
}

// Define OptionChoice ensuring priceAdjustment is a number for forms
export type OptionChoiceWithNumericPrice = Omit<OptionChoice, "priceAdjustment"> & {
  priceAdjustment: number
}

// Define ItemOption ensuring OptionChoices AND the option itself have numeric price
// Also make menuItem optional
export type ItemOptionWithRelations = Omit<MenuItemOption, "optionChoices" | "priceAdjustment"> & { // Omit original priceAdjustment
  priceAdjustment: number // Redefine priceAdjustment as number
  optionChoices: OptionChoiceWithNumericPrice[]
  menuItem?: MenuItem & { // Make menuItem optional here
    restaurant: Restaurant
  }
  // Add fields prepared in the action
  menuItemName?: string
  restaurantName?: string
  choicesCount?: number
}

// Type for the props of RestaurantMenuClient
export interface RestaurantMenuClientProps {
  restaurant: RestaurantWithCategories
  allMenuItems: MenuItemWithRelations[]
  allItemOptions: ItemOptionWithRelations[]
  restaurantId: string
}

// Type for the props of ItemOptionEditModal
export interface ItemOptionEditModalProps {
  itemOption?: ItemOptionWithRelations | null // Use the shared type
  menuItems: (MenuItem & { restaurant: Restaurant })[]
  open: boolean
  onOpenChange: (refresh: boolean) => void
  mode: "create" | "edit"
}

// Type for the props of MenuItemEditModal (assuming it might need similar types)
export interface MenuItemEditModalProps {
    menuItem?: MenuItemWithRelations | null
    categories: Category[]
    restaurants: Restaurant[] // Assuming you pass the full restaurant object
    open: boolean
    onOpenChange: (refresh: boolean) => void
    mode: "create" | "edit"
}

export type OrderWithRelations = Order & {
  orderItems: (OrderItem & {
    menuItem: MenuItem
    orderItemChoices: (OptionChoiceWithNumericPrice & {
      menuItemOption: (Omit<MenuItemOption, "priceAdjustment"> & {
        priceAdjustment: number
      }) | null
      optionChoice: OptionChoiceWithNumericPrice | null
    })[]
  })[]
  table?: Table | null
  user?: {
    name: string | null
    email: string
  } | null
}
