import { create } from "zustand";
import { persist } from "zustand/middleware";

type Currency = "USD" | "VND";

interface CurrencyState {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
}

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set) => ({
      currency: "USD",
      setCurrency: (currency) => set({ currency }),
    }),
    {
      name: "currency-store",
    }
  )
);
