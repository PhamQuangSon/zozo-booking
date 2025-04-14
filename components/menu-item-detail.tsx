"use client"

import Image from "next/image"
import { useState, useEffect, useRef } from "react"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { useCurrencyStore } from "@/store/currency-store"
import { formatCurrency } from "@/lib/i18n"

interface OptionChoice {
  id: number | string
  name: string
  priceAdjustment: number
}

interface MenuItemOption {
  id: number | string
  name: string
  isRequired: boolean
  optionChoices: OptionChoice[]
}

interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  imageUrl?: string
  categoryName?: string
  menuItemOptions?: MenuItemOption[]
}

interface MenuItemDetailProps {
  item: MenuItem
  onAddToCart: (options: Record<string, any>, quantity: number, specialInstructions: string) => void
}

export function MenuItemDetail({ item, onAddToCart }: MenuItemDetailProps) {
  const { currency } = useCurrencyStore()
  const [quantity, setQuantity] = useState(1)
  const [selectedOptions, setSelectedOptions] = useState<Record<string, any>>({})
  const [specialInstructions, setSpecialInstructions] = useState("")

  // Use a ref to store initial values to prevent infinite re-renders
  const initializedRef = useRef(false)

  // Initialize selected options only once
  useEffect(() => {
    if (initializedRef.current) return

    const initialOptions: Record<string, any> = {}

    // Process menu item options if available
    if (item.menuItemOptions && item.menuItemOptions.length > 0) {
      item.menuItemOptions.forEach((option) => {
        if (option.isRequired && option.optionChoices.length > 0) {
          // Select the first option by default for required options
          const defaultChoice = option.optionChoices[0]
          initialOptions[option.id] = {
            id: defaultChoice.id,
            name: defaultChoice.name,
            priceAdjustment: defaultChoice.priceAdjustment || 0,
          }
        }
      })
    }

    setSelectedOptions(initialOptions)
    initializedRef.current = true
  }, [item])

  const handleRadioOptionChange = (optionId: string, choiceId: string, choiceName: string, priceAdjustment: number) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [optionId]: {
        id: choiceId,
        name: choiceName,
        priceAdjustment: priceAdjustment,
      },
    }))
  }

  const handleCheckboxOptionChange = (
    optionId: string,
    choiceId: string,
    choiceName: string,
    priceAdjustment: number,
    checked: boolean,
  ) => {
    setSelectedOptions((prev) => {
      const newOptions = { ...prev }

      if (!newOptions[optionId]) {
        newOptions[optionId] = {}
      }

      if (checked) {
        newOptions[optionId][choiceId] = {
          id: choiceId,
          name: choiceName,
          priceAdjustment: priceAdjustment,
        }
      } else {
        delete newOptions[optionId][choiceId]
      }

      return newOptions
    })
  }

  // Calculate total price including options
  const calculateTotalPrice = () => {
    let total = item.price

    // Add price adjustments from selected options
    Object.values(selectedOptions).forEach((option) => {
      if (typeof option === "object") {
        if ("priceAdjustment" in option) {
          // Single selection (radio)
          total += option.priceAdjustment || 0
        } else {
          // Multiple selections (checkboxes)
          Object.values(option).forEach((choice: any) => {
            total += choice.priceAdjustment || 0
          })
        }
      }
    })

    return total * quantity
  }

  const handleSubmit = () => {
    onAddToCart(selectedOptions, quantity, specialInstructions)
  }

  return (
    <div className="space-y-4">
      <div className="relative h-24 w-full overflow-hidden rounded-md">
        <Image src={item.imageUrl || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
      </div>

      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{item.description}</p>
          <p className="mt-2 text-lg font-semibold">{formatCurrency(item.price, currency)}</p>
        </div>
        <Button variant="outline" size="icon">
          <Heart className="h-4 w-4" />
        </Button>
      </div>

      <Separator />

      <div className="space-y-4">
        {item.menuItemOptions?.map((option) => (
          <div key={option.id} className="glass-card p-4 rounded-xl">
            <h4 className="mb-2 font-medium">
              {option.name} {option.isRequired && <span className="text-sm text-destructive">*</span>}
            </h4>

            {option.isRequired ? (
              <RadioGroup
                value={selectedOptions[option.id]?.id?.toString()}
                onValueChange={(value) => {
                  const choice = option.optionChoices.find((c) => c.id.toString() === value)
                  if (choice) {
                    handleRadioOptionChange(
                      option.id.toString(),
                      choice.id.toString(),
                      choice.name,
                      choice.priceAdjustment || 0,
                    )
                  }
                }}
              >
                {option.optionChoices.map((choice) => (
                  <div
                    key={choice.id}
                    className="flex items-center justify-between space-x-2 p-2 hover:bg-white/40 rounded-lg transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value={choice.id.toString()} id={`${option.id}-${choice.id}`} />
                      <Label htmlFor={`${option.id}-${choice.id}`}>{choice.name}</Label>
                    </div>
                    {choice.priceAdjustment > 0 && (
                      <span className="text-sm font-medium">+{formatCurrency(choice.priceAdjustment, currency)}</span>
                    )}
                  </div>
                ))}
              </RadioGroup>
            ) : (
              <div className="space-y-2">
                {option.optionChoices.map((choice) => (
                  <div
                    key={choice.id}
                    className="flex items-center justify-between space-x-2 p-2 hover:bg-white/40 rounded-lg transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`${option.id}-${choice.id}`}
                        checked={!!selectedOptions[option.id]?.[choice.id]}
                        onCheckedChange={(checked) => {
                          handleCheckboxOptionChange(
                            option.id.toString(),
                            choice.id.toString(),
                            choice.name,
                            choice.priceAdjustment || 0,
                            !!checked,
                          )
                        }}
                      />
                      <Label htmlFor={`${option.id}-${choice.id}`}>{choice.name}</Label>
                    </div>
                    {choice.priceAdjustment > 0 && (
                      <span className="text-sm font-medium">+{formatCurrency(choice.priceAdjustment, currency)}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div>
        <h4 className="mb-2 font-medium">Special Instructions</h4>
        <Input
          placeholder="E.g., No onions, extra spicy, etc."
          value={specialInstructions}
          onChange={(e) => setSpecialInstructions(e.target.value)}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
            -
          </Button>
          <span>{quantity}</span>
          <Button variant="outline" size="icon" onClick={() => setQuantity(quantity + 1)}>
            +
          </Button>
        </div>
        <Button onClick={handleSubmit}>Add to Order - {formatCurrency(calculateTotalPrice(), currency)}</Button>
      </div>
    </div>
  )
}
