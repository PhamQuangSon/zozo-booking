"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { updateCategory } from "@/actions/category-actions"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Category, Restaurant } from "@prisma/client"

// Extended Category type with restaurant relation
type CategoryWithRestaurant = Category & {
  restaurant: {
    id: number
    name: string
  }
}

interface CategoryEditModalProps {
  category: CategoryWithRestaurant
  restaurants: Restaurant[]
  open: boolean
  onOpenChange: (refresh: boolean) => void
}

export function CategoryEditModal({ category, restaurants, open, onOpenChange }: CategoryEditModalProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    restaurantId: 0,
    displayOrder: 0,
  })

  // Update form data when category changes
  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        description: category.description || "",
        restaurantId: category.restaurantId,
        displayOrder: category.displayOrder,
      })
    }
  }, [category])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, restaurantId: Number.parseInt(value) }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!category) return

    setIsLoading(true)
    try {
      const result = await updateCategory(category.id, {
        name: formData.name,
        description: formData.description || null,
        restaurantId: formData.restaurantId,
        display_order: formData.displayOrder,
      })

      if (result.success) {
        toast({
          title: "Category updated",
          description: "The category has been updated successfully.",
        })
        onOpenChange(true) // Close modal and refresh data
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "Failed to update category",
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onOpenChange(false)}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Category</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Category name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Category description (optional)"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="restaurantId">Restaurant</Label>
            <Select value={formData.restaurantId.toString()} onValueChange={handleSelectChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select a restaurant" />
              </SelectTrigger>
              <SelectContent>
                {restaurants.map((restaurant) => (
                  <SelectItem key={restaurant.id} value={restaurant.id.toString()}>
                    {restaurant.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="displayOrder">Display Order</Label>
            <Input
              id="displayOrder"
              name="displayOrder"
              type="number"
              value={formData.displayOrder}
              onChange={(e) => setFormData((prev) => ({ ...prev, displayOrder: Number.parseInt(e.target.value) || 0 }))}
              min={0}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

