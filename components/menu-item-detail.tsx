"use client"

import Image from "next/image"
import { useState } from "react"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"

interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  image: string
}

interface MenuItemDetailProps {
  item: MenuItem
}

export function MenuItemDetail({ item }: MenuItemDetailProps) {
  const [quantity, setQuantity] = useState(1)

  // These would come from the database in a real app
  const options = {
    sizes: [
      { id: "regular", name: "Regular", price: 0 },
      { id: "large", name: "Large", price: 2 },
    ],
    extras: [
      { id: "cheese", name: "Extra Cheese", price: 1.5 },
      { id: "garlic", name: "Garlic Bread", price: 2 },
      { id: "sauce", name: "Extra Sauce", price: 1 },
    ],
  }

  return (
    <div className="space-y-4">
      <div className="relative h-48 w-full overflow-hidden rounded-md">
        <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
      </div>

      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{item.description}</p>
          <p className="mt-2 text-lg font-semibold">${item.price.toFixed(2)}</p>
        </div>
        <Button variant="outline" size="icon">
          <Heart className="h-4 w-4" />
        </Button>
      </div>

      <Separator />

      <div>
        <h4 className="mb-2 font-medium">Size</h4>
        <RadioGroup defaultValue="regular">
          {options.sizes.map((size) => (
            <div key={size.id} className="flex items-center justify-between space-x-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value={size.id} id={`size-${size.id}`} />
                <Label htmlFor={`size-${size.id}`}>{size.name}</Label>
              </div>
              {size.price > 0 && <span className="text-sm">+${size.price.toFixed(2)}</span>}
            </div>
          ))}
        </RadioGroup>
      </div>

      <div>
        <h4 className="mb-2 font-medium">Extras</h4>
        {options.extras.map((extra) => (
          <div key={extra.id} className="flex items-center justify-between space-x-2">
            <div className="flex items-center space-x-2">
              <Checkbox id={`extra-${extra.id}`} />
              <Label htmlFor={`extra-${extra.id}`}>{extra.name}</Label>
            </div>
            <span className="text-sm">+${extra.price.toFixed(2)}</span>
          </div>
        ))}
      </div>

      <div>
        <h4 className="mb-2 font-medium">Special Instructions</h4>
        <Input placeholder="E.g., No onions, extra spicy, etc." />
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
        <Button>Add to Order - ${(item.price * quantity).toFixed(2)}</Button>
      </div>
    </div>
  )
}

