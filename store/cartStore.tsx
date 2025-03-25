import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image_url?: string
  restaurantId: string
  tableId: string
  categoryName?: string
  specialInstructions?: string
  selectedOptions?: Record<string, any>
  submitted?: boolean // Flag to track if the item has been submitted
}

interface CartState {
  cart: CartItem[]
  addToCart: (item: CartItem) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  markItemsAsSubmitted: (restaurantId: string, tableId: string) => void
  getSubmittedItems: (restaurantId: string, tableId: string) => CartItem[]
  getPendingItems: (restaurantId: string, tableId: string) => CartItem[]
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: [],

      addToCart: (item) =>
        set((state) => {
          // Check if item already exists in cart
          const existingItemIndex = state.cart.findIndex(
            (i) => i.id === item.id && i.restaurantId === item.restaurantId && i.tableId === item.tableId,
          )

          if (existingItemIndex >= 0) {
            // Update existing item
            const updatedCart = [...state.cart]
            updatedCart[existingItemIndex] = {
              ...updatedCart[existingItemIndex],
              quantity: updatedCart[existingItemIndex].quantity + item.quantity,
            }
            return { cart: updatedCart }
          } else {
            // Add new item
            return { cart: [...state.cart, { ...item, submitted: false }] }
          }
        }),

      removeItem: (id) =>
        set((state) => ({
          cart: state.cart.filter((item) => item.id !== id),
        })),

      updateQuantity: (id, quantity) =>
        set((state) => ({
          cart: state.cart.map((item) => (item.id === id ? { ...item, quantity } : item)),
        })),

      markItemsAsSubmitted: (restaurantId, tableId) =>
        set((state) => ({
          cart: state.cart.map((item) =>
            item.restaurantId === restaurantId && item.tableId === tableId ? { ...item, submitted: true } : item,
          ),
        })),

      getSubmittedItems: (restaurantId, tableId) => {
        return get().cart.filter(
          (item) => item.restaurantId === restaurantId && item.tableId === tableId && item.submitted === true,
        )
      },

      getPendingItems: (restaurantId, tableId) => {
        return get().cart.filter(
          (item) =>
            item.restaurantId === restaurantId &&
            item.tableId === tableId &&
            (item.submitted === false || item.submitted === undefined),
        )
      },
    }),
    {
      name: "food-ordering-cart",
    },
  ),
)

