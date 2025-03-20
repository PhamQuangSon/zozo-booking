"use client"

import type React from "react"

import { useState } from "react"
import { X, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DialogFooter } from "@/components/ui/dialog"

// Add imports for currency support
import { useCurrencyStore } from "@/lib/currency-store"
import { convertCurrency } from "@/lib/i18n"

interface MenuItemFormProps {
  onSubmit: () => void
  initialData?: any
}

export function MenuItemForm({ onSubmit, initialData }: MenuItemFormProps) {
  const { currency } = useCurrencyStore()
  const [name, setName] = useState(initialData?.name || "")
  const [description, setDescription] = useState(initialData?.description || "")
  const [price, setPrice] = useState(initialData?.price?.toString() || "")
  const [category, setCategory] = useState(initialData?.category || "")
  const [options, setOptions] = useState<{ name: string; price: string }[]>(
    initialData?.options || [{ name: "", price: "" }],
  )

  const addOption = () => {
    setOptions([...options, { name: "", price: "" }])
  }

  const removeOption = (index: number) => {
    const newOptions = [...options]
    newOptions.splice(index, 1)
    setOptions(newOptions)
  }

  const updateOption = (index: number, field: "name" | "price", value: string) => {
    const newOptions = [...options]
    newOptions[index][field] = value
    setOptions(newOptions)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Make sure to convert prices to USD for storage if not already in USD
    const priceInUSD =
      currency === "USD" ? Number.parseFloat(price) : convertCurrency(Number.parseFloat(price), currency, "USD")

    console.log({
      name,
      description,
      price: priceInUSD,
      category,
      options: options
        .filter((opt) => opt.name && opt.price)
        .map((opt) => ({
          name: opt.name,
          price:
            currency === "USD"
              ? Number.parseFloat(opt.price)
              : convertCurrency(Number.parseFloat(opt.price), currency, "USD"),
        })),
    })
    onSubmit()
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">Price ({currency})</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select value={category} onValueChange={setCategory} required>
            <SelectTrigger id="category">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Appetizers">Appetizers</SelectItem>
              <SelectItem value="Pasta">Pasta</SelectItem>
              <SelectItem value="Main Courses">Main Courses</SelectItem>
              <SelectItem value="Desserts">Desserts</SelectItem>
              <SelectItem value="Beverages">Beverages</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label>Image Upload</Label>
          <Input type="file" accept="image/*" />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Options (Size, Extras, etc.)</Label>
            <Button type="button" variant="outline" size="sm" onClick={addOption}>
              <Plus className="mr-2 h-4 w-4" />
              Add Option
            </Button>
          </div>
          <div className="space-y-2">
            {options.map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  placeholder="Option name"
                  value={option.name}
                  onChange={(e) => updateOption(index, "name", e.target.value)}
                />
                <Input
                  placeholder="Price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={option.price}
                  onChange={(e) => updateOption(index, "price", e.target.value)}
                />
                <Button type="button" variant="ghost" size="icon" onClick={() => removeOption(index)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button type="submit">Save Menu Item</Button>
      </DialogFooter>
    </form>
  )
}

