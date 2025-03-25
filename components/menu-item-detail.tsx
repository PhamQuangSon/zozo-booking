"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { useCurrencyStore } from "@/store/currencyStore"
import { formatCurrency } from "@/lib/i18n"
import Image from "next/image"

interface MenuItemDetailProps {
  item: {
    id: string
    name: string
    description: string
    price: number
    image?: string
    image_url?: string
    options?: any[]
  }
  onAddToCart: (options: any, quantity: number, specialInstructions: string) => void
}

export function MenuItemDetail({ item, onAddToCart }: MenuItemDetailProps) {
  const [quantity, setQuantity] = useState(1)
  const [selectedOptions, setSelectedOptions] = useState<Record<string, any>>({})
  const [specialInstructions, setSpecialInstructions] = useState("")
  const { currency } = useCurrencyStore()

  const handleOptionChange = (optionId: string, choice: any) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [optionId]: choice,
    }))
  }

  const calculateTotalPrice = () => {
    let total = item.price

    // Add price adjustments from selected options
    Object.values(selectedOptions).forEach((option: any) => {
      if (option.priceAdjustment) {
        total += option.priceAdjustment
      }
    })

    return total * quantity
  }

  const handleAddToCart = () => {
    onAddToCart(selectedOptions, quantity, specialInstructions)

    // Reset form fields but don't close dialog
    setQuantity(1)
    setSelectedOptions({})
    setSpecialInstructions("")
  }

  return (
    <div className="space-y-6 py-4">
      {/* Item Image */}
      {(item.image_url || item.image) && (
        <div className="relative h-48 w-full overflow-hidden rounded-md">
          <Image
            src={item.image_url || item.image || "/placeholder.svg"}
            alt={item.name}
            fill
            className="object-cover"
          />
        </div>
      )}

      {/* Item Description */}
      <p className="text-sm text-muted-foreground">{item.description}</p>

      {/* Item Options */}
      {item.options && item.options.length > 0 && (
        <div className="space-y-4">
          {item.options.map((option) => (
            <div key={option.id} className="space-y-2">
              <Label>{option.name}</Label>
              <RadioGroup
                value={selectedOptions[option.id]?.id}
                onValueChange={(value) => {
                  const choice = option.choices.find((c: any) => c.id === value)
                  handleOptionChange(option.id, {
                    id: choice.id,
                    name: choice.name,
                    priceAdjustment: choice.price_adjustment,
                  })
                }}
              >
                {option.choices.map((choice: any) => (
                  <div key={choice.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value={choice.id} id={`option-${option.id}-${choice.id}`} />
                      <Label htmlFor={`option-${option.id}-${choice.id}`} className="font-normal">
                        {choice.name}
                      </Label>
                    </div>
                    {choice.price_adjustment > 0 && (
                      <span className="text-sm">+{formatCurrency(choice.price_adjustment, currency)}</span>
                    )}
                  </div>
                ))}
              </RadioGroup>
            </div>
          ))}
        </div>
      )}

      {/* Special Instructions */}
      <div className="space-y-2">
        <Label htmlFor="special-instructions">Special Instructions</Label>
        <Textarea
          id="special-instructions"
          placeholder="Any special requests?"
          value={specialInstructions}
          onChange={(e) => setSpecialInstructions(e.target.value)}
        />
      </div>

      {/* Quantity */}
      <div className="space-y-2">
        <Label htmlFor="quantity">Quantity</Label>
        <div className="flex items-center space-x-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={quantity <= 1}
          >
            -
          </Button>
          <Input
            id="quantity"
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(Number.parseInt(e.target.value) || 1)}
            className="w-16 text-center"
          />
          <Button type="button" variant="outline" size="icon" onClick={() => setQuantity(quantity + 1)}>
            +
          </Button>
        </div>
      </div>

      {/* Total Price */}
      <div className="flex items-center justify-between">
        <span className="font-medium">Total:</span>
        <span className="text-xl font-bold">{formatCurrency(calculateTotalPrice(), currency)}</span>
      </div>

      {/* Add to Cart Button */}
      <Button className="w-full" onClick={handleAddToCart}>
        Add to Order
      </Button>
    </div>
  )
}

