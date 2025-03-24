import create from 'zustand';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  selectedOptions?: Record<string, any>;
  specialInstructions?: string;
  restaurantId?: string;
  tableId?: string;
}

interface CartStore {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeItem: (id: string) => void; // Add removeItem function
}

export const useCartStore = create<CartStore>((set) => ({
  cart: [],
  addToCart: (item) =>
    set((state) => {
      const existingItem = state.cart.find((cartItem) => cartItem.id === item.id);
      if (existingItem) {
        return {
          cart: state.cart.map((cartItem) =>
            cartItem.id === item.id
              ? { ...cartItem, quantity: cartItem.quantity + item.quantity }
              : cartItem
          ),
        };
      }
      return { cart: [...state.cart, item] };
    }),
  removeItem: (id) =>
    set((state) => ({
      cart: state.cart.filter((cartItem) => cartItem.id !== id),
    })),
}));