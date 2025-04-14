"use client"

import React from "react"

import { useEffect } from "react"
import { Check, ChevronsUpDown, DollarSign, CircleDollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import type { Currency } from "@/lib/i18n"
import { useCurrencyStore } from "@/store/currency-store"

const currencies = [
  { value: "USD", label: "USD ($)", icon: DollarSign, description: "United States Dollar" },
  { value: "VND", label: "VND (₫)", icon: CircleDollarSign, description: "Vietnamese Dong" },
]

export function CurrencySelector() {
  const { currency, setCurrency } = useCurrencyStore()
  const [open, setOpen] = React.useState(false)

  // Initialize from localStorage if available
  useEffect(() => {
    const savedCurrency = localStorage.getItem("currency") as Currency | null
    if (savedCurrency && (savedCurrency === "USD" || savedCurrency === "VND")) {
      setCurrency(savedCurrency)
    }
  }, [setCurrency])

  const selectedCurrency = currencies.find((item) => item.value === currency)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-[120px] justify-between">
          {selectedCurrency ? (
            <>
              <selectedCurrency.icon className="mr-2 h-4 w-4" />
              {selectedCurrency.value}
            </>
          ) : (
            "USD"
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandList>
            <CommandEmpty>No currency found.</CommandEmpty>
            <CommandGroup>
              {currencies.map((item) => (
                <CommandItem
                  key={item.value}
                  value={item.value}
                  onSelect={(value) => {
                    setCurrency(value as Currency)
                    localStorage.setItem("currency", value)
                    setOpen(false)
                  }}
                >
                  <Check className={cn("mr-2 h-4 w-4", currency === item.value ? "opacity-100" : "opacity-0")} />
                  <item.icon className="mr-2 h-4 w-4" />
                  <div className="flex flex-col">
                    <span>{item.label}</span>
                    <span className="text-xs text-muted-foreground">{item.description}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

