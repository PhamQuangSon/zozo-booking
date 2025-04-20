import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  restaurantId: string;
  tableId: string;
  categoryName?: string;
  specialInstructions?: string;
  selectedOptions?: Record<string, any>;
  submitted?: boolean; // Flag to track if the item has been submitted
  orderId?: number; // Reference to server order if item was synced
  orderItemId?: number; // Reference to server order item if item was synced
}

interface CartState {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  markItemsAsSubmitted: (
    restaurantId: string,
    tableId: string,
    orderId: number,
  ) => void;
  getSubmittedItems: (restaurantId: string, tableId: string) => CartItem[];
  getPendingItems: (restaurantId: string, tableId: string) => CartItem[];
  syncServerOrders: (
    restaurantId: string,
    tableId: string,
    orders: any[],
  ) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: [],

      addToCart: (item) =>
        set((state) => {
          // Check if item already exists in cart
          const isSameItem = (i: any) =>
            i.id === item.id &&
            i.restaurantId === item.restaurantId &&
            i.tableId === item.tableId &&
            JSON.stringify(i.selectedOptions) ===
              JSON.stringify(item.selectedOptions);

          const existingItemIndex = state.cart.findIndex(isSameItem);

          if (existingItemIndex >= 0) {
            // Update existing item
            const updatedCart = [...state.cart];
            updatedCart[existingItemIndex] = {
              ...updatedCart[existingItemIndex],
              quantity: updatedCart[existingItemIndex].quantity + item.quantity,
            };
            return { cart: updatedCart };
          } else {
            // Add new item
            return { cart: [...state.cart, { ...item, submitted: false }] };
          }
        }),

      removeItem: (id) =>
        set((state) => ({
          cart: state.cart.filter((item) => item.id !== id),
        })),

      updateQuantity: (id, quantity) =>
        set((state) => ({
          cart: state.cart.map((item) =>
            item.id === id ? { ...item, quantity } : item,
          ),
        })),

      markItemsAsSubmitted: (restaurantId, tableId, orderId) =>
        set((state) => ({
          cart: state.cart.map((item) =>
            item.restaurantId === restaurantId && item.tableId === tableId
              ? { ...item, submitted: true, orderId }
              : item,
          ),
        })),

      syncServerOrders: (restaurantId, tableId, orders) =>
        set((state) => {
          // Convert server orders to cart items
          const serverItems = orders.flatMap((order) =>
            order.orderItems.map(
              (item: {
                id: number;
                menuItem: {
                  id: number;
                  name: string;
                  imageUrl?: string;
                };
                quantity: number;
                unitPrice: number;
                notes?: string;
                orderItemChoices?: Array<{
                  id: number;
                  optionChoiceId: number;
                  optionChoice: {
                    id: number;
                    name: string;
                    priceAdjustment: number;
                  };
                }>;
              }) => ({
                id: String(item.menuItem.id),
                name: item.menuItem.name,
                price: Number(item.unitPrice),
                quantity: item.quantity,
                imageUrl: item.menuItem.imageUrl,
                restaurantId,
                tableId,
                submitted: true,
                orderId: order.id,
                orderItemId: item.id,
                specialInstructions: item.notes,
                selectedOptions: item.orderItemChoices?.reduce(
                  (acc, choice) => ({
                    ...acc,
                    [choice.id]: {
                      id: String(choice.id),
                      name: choice.optionChoice.name,
                      priceAdjustment: Number(
                        choice.optionChoice.priceAdjustment,
                      ),
                    },
                  }),
                  {},
                ),
              }),
            ),
          );

          // Merge with existing cart items, preserving non-submitted items
          const existingPendingItems = state.cart.filter(
            (item) =>
              !(
                item.restaurantId === restaurantId &&
                item.tableId === tableId &&
                item.submitted
              ),
          );

          return {
            cart: [...existingPendingItems, ...serverItems],
          };
        }),

      getSubmittedItems: (restaurantId, tableId) => {
        return get().cart.filter(
          (item) =>
            item.restaurantId === restaurantId &&
            item.tableId === tableId &&
            item.submitted === true,
        );
      },

      getPendingItems: (restaurantId, tableId) => {
        return get().cart.filter(
          (item) =>
            item.restaurantId === restaurantId &&
            item.tableId === tableId &&
            (item.submitted === false || item.submitted === undefined),
        );
      },
    }),
    {
      name: "food-ordering-cart",
    },
  ),
);
