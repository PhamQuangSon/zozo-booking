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
  userId: string | null; // User who added this item
  userName?: string; // Name of the user who added this item
  timestamp?: number; // Add timestamp for ordering
}

interface CartState {
  cart: CartItem[];
  collaborativeMode: boolean;
  addToCart: (item: CartItem) => void;
  removeItem: (id: string, userId?: string) => void;
  updateQuantity: (id: string, quantity: number, userId?: string) => void;
  markItemsAsSubmitted: (
    restaurantId: string,
    tableId: string,
    orderId: number
  ) => void;
  getSubmittedItems: (restaurantId: string, tableId: string) => CartItem[];
  getPendingItems: (restaurantId: string, tableId: string) => CartItem[];
  syncServerOrders: (
    restaurantId: string,
    tableId: string,
    orders: any[]
  ) => void;
  mergeExternalCart: (userId: string, externalCart: CartItem[]) => void;
  setCollaborativeMode: (enabled: boolean) => void;
  clearCart: () => void;
}

// Helper function to generate a unique key for an item
const getItemKey = (item: CartItem): string => {
  return `${item.id}-${item.restaurantId}-${item.tableId}-${item.userId || "anonymous"}-${JSON.stringify(item.selectedOptions || {})}-${item.submitted ? "submitted" : "pending"}-${item.orderId || "none"}-${item.orderItemId || "none"}`;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: [],
      collaborativeMode: true,

      addToCart: (item) =>
        set((state) => {
          // Add timestamp for ordering
          const itemWithTimestamp = {
            ...item,
            timestamp: Date.now(),
            submitted: false,
          };

          // Check if item already exists in cart
          const isSameItem = (i: CartItem) =>
            i.id === item.id &&
            i.restaurantId === item.restaurantId &&
            i.tableId === item.tableId &&
            i.userId === item.userId &&
            JSON.stringify(i.selectedOptions) ===
              JSON.stringify(item.selectedOptions) &&
            !i.submitted; // Only match non-submitted items

          const existingItemIndex = state.cart.findIndex(isSameItem);

          if (existingItemIndex >= 0) {
            // Update existing item
            const updatedCart = [...state.cart];
            updatedCart[existingItemIndex] = {
              ...updatedCart[existingItemIndex],
              quantity: updatedCart[existingItemIndex].quantity + item.quantity,
              timestamp: item.timestamp || Date.now(),
            };
            return { cart: updatedCart };
          } else {
            // Add new item
            return { cart: [...state.cart, itemWithTimestamp] };
          }
        }),

      removeItem: (id, userId) =>
        set((state) => {
          // If userId is provided, only remove items from that user
          if (userId) {
            return {
              cart: state.cart.filter(
                (item) =>
                  !(item.id === id && item.userId === userId && !item.submitted)
              ),
            };
          }
          // Otherwise, remove all matching non-submitted items
          return {
            cart: state.cart.filter(
              (item) => !(item.id === id && !item.submitted)
            ),
          };
        }),

      updateQuantity: (id, quantity, userId) =>
        set((state) => {
          return {
            cart: state.cart.map((item) => {
              // Only update if id matches and either userId matches or userId is not provided
              if (
                item.id === id &&
                (!userId || item.userId === userId) &&
                !item.submitted
              ) {
                return { ...item, quantity, timestamp: Date.now() };
              }
              return item;
            }),
          };
        }),

      markItemsAsSubmitted: (restaurantId, tableId, orderId) =>
        set((state) => ({
          cart: state.cart.map((item) =>
            item.restaurantId === restaurantId &&
            item.tableId === tableId &&
            !item.submitted
              ? { ...item, submitted: true, orderId, timestamp: Date.now() }
              : item
          ),
        })),

      syncServerOrders: (restaurantId, tableId, orders) =>
        set((state) => {
          // Get existing non-submitted items for this restaurant/table
          const existingPendingItems = state.cart.filter(
            (item) =>
              item.restaurantId === restaurantId &&
              item.tableId === tableId &&
              !item.submitted
          );

          // Get existing submitted items for other restaurant/tables
          const otherItems = state.cart.filter(
            (item) =>
              !(
                item.restaurantId === restaurantId &&
                item.tableId === tableId &&
                item.submitted
              )
          );

          // Convert server orders to cart items
          const serverItems: CartItem[] = [];
          const processedKeys = new Set<string>();

          orders.forEach((order) => {
            if (!order.orderItems || !Array.isArray(order.orderItems)) return;

            order.orderItems.forEach((item: any) => {
              if (!item.menuItem) return;

              const cartItem: CartItem = {
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
                userId: order.user?.id || undefined,
                userName:
                  order.user?.name ||
                  (order.notes &&
                    order.notes.split("Customer Info:")[1].trim()) ||
                  "Anonymous 5",
                // timestamp: new Date(order.createdAt || Date.now()).getTime(),
                selectedOptions: item.orderItemChoices?.reduce(
                  (acc: Record<string, any>, choice: any) => {
                    if (!choice.menuItemOption || !choice.optionChoice)
                      return acc;

                    return {
                      ...acc,
                      [choice.menuItemOption.id]: {
                        id: String(choice.optionChoice.id),
                        name: choice.optionChoice.name,
                        priceAdjustment: Number(
                          choice.optionChoice.priceAdjustment
                        ),
                      },
                    };
                  },
                  {}
                ),
              };

              // Generate a unique key for this item
              const itemKey = getItemKey(cartItem);

              // Only add if we haven't processed this exact item before
              if (!processedKeys.has(itemKey)) {
                serverItems.push(cartItem);
                processedKeys.add(itemKey);
              }
            });
          });

          // Merge everything together
          return {
            cart: [...otherItems, ...existingPendingItems, ...serverItems],
          };
        }),

      mergeExternalCart: (userId, externalCart) =>
        set((state) => {
          if (!state.collaborativeMode) return state;

          // Create a map of existing items for quick lookup
          const existingItemsMap = new Map<string, boolean>();
          state.cart.forEach((item) => {
            const key = getItemKey(item);
            existingItemsMap.set(key, true);
          });

          // Filter out items that are already in our cart
          const newItems = externalCart.filter((externalItem) => {
            const itemWithUserId = {
              ...externalItem,
              userId: externalItem.userId || userId,
            };
            const key = getItemKey(itemWithUserId);
            return !existingItemsMap.has(key);
          });

          // Add userId to each item if not already present
          const itemsWithUserId = newItems.map((item) => ({
            ...item,
            userId: item.userId || userId,
            // timestamp: item.timestamp || Date.now(),
          }));

          return {
            cart: [...state.cart, ...itemsWithUserId],
          };
        }),

      setCollaborativeMode: (enabled) => set({ collaborativeMode: enabled }),

      clearCart: () => set({ cart: [] }),

      getSubmittedItems: (restaurantId, tableId) => {
        const items = get().cart.filter(
          (item) =>
            item.restaurantId === restaurantId &&
            item.tableId === tableId &&
            item.submitted === true
        );

        // Sort by timestamp
        return items.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
      },

      getPendingItems: (restaurantId, tableId) => {
        const items = get().cart.filter(
          (item) =>
            item.restaurantId === restaurantId &&
            item.tableId === tableId &&
            (item.submitted === false || item.submitted === undefined)
        );

        // Sort by timestamp
        return items.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
      },
    }),
    {
      name: "food-ordering-cart",
      // Add a version number to the storage to handle migrations
      version: 2,
      // Add a migration function to handle old data
      migrate: (persistedState: any, version: number) => {
        if (version === 0 || version === 1) {
          // Clear the cart to avoid any issues with old data structure
          return { cart: [], collaborativeMode: true };
        }
        return persistedState as CartState;
      },
    }
  )
);
