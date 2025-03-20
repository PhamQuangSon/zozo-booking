const EXCHANGE_RATES = {
  USD: 1,
  VND: 24000, // Example rate: 1 USD = 24,000 VND
}

export type Currency = "USD" | "VND"

export function formatCurrency(amount: number, currency: Currency = "USD"): string {
  // Convert amount to the target currency
  const convertedAmount = amount * EXCHANGE_RATES[currency]

  // Format with appropriate locale and options
  return new Intl.NumberFormat(currency === "USD" ? "en-US" : "vi-VN", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: currency === "VND" ? 0 : 2,
    maximumFractionDigits: currency === "VND" ? 0 : 2,
  }).format(convertedAmount)
}

// Format currency without the currency symbol
export function formatCurrencyValue(amount: number, currency: Currency = "USD"): string {
  const convertedAmount = amount * EXCHANGE_RATES[currency]

  return new Intl.NumberFormat(currency === "USD" ? "en-US" : "vi-VN", {
    minimumFractionDigits: currency === "VND" ? 0 : 2,
    maximumFractionDigits: currency === "VND" ? 0 : 2,
  }).format(convertedAmount)
}

// Convert from one currency to another
export function convertCurrency(amount: number, fromCurrency: Currency, toCurrency: Currency): number {
  // First convert to USD (base currency)
  const amountInUSD = fromCurrency === "USD" ? amount : amount / EXCHANGE_RATES[fromCurrency]
  // Then convert to target currency
  return amountInUSD * EXCHANGE_RATES[toCurrency]
}

