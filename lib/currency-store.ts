"use client"

import { create } from "zustand"
import type { Currency } from "@/lib/i18n"

interface CurrencyState {
  currency: Currency
  setCurrency: (currency: Currency) => void
}

export const useCurrencyStore = create<CurrencyState>((set) => ({
  currency: "USD",
  setCurrency: (currency) => set({ currency }),
}))

