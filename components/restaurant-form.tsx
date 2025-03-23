"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DialogFooter } from "@/components/ui/dialog"
import { createRestaurant, updateRestaurant } from "@/actions/restaurant-actions"
import { useToast } from "@/hooks/use-toast"
import { ImageUpload } from "@/components/image-upload"

interface RestaurantFormProps {
  initialData?: any
  onSuccess: () => void
}

export function RestaurantForm({ initialData, onSuccess }: RestaurantFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    address: initialData?.address || "",
    phone: initialData?.phone || "",
    email: initialData?.email || "",
    image_url: initialData?.image_url || "",
    cuisine: initialData?.cuisine || "",
  })
  const { toast } = useToast()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (value: string) => {
    setFormData((prev) => ({ ...prev, image_url: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const result = initialData ? await updateRestaurant(initialData.id, formData) : await createRestaurant(formData)

      if (result.success) {
        toast({
          title: "Success",
          description: initialData ? "Restaurant updated successfully" : "Restaurant created successfully",
        })
        onSuccess()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to save restaurant",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error saving restaurant:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name *</Label>
          <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
        </div>

        <ImageUpload value={formData.image_url} onChange={handleImageChange} label="Restaurant Image" />

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={3} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cuisine">Cuisine</Label>
          <Input id="cuisine" name="cuisine" value={formData.cuisine} onChange={handleChange} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" name="address" value={formData.address} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} />
        </div>
      </div>
      <DialogFooter>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : initialData ? "Update Restaurant" : "Create Restaurant"}
        </Button>
      </DialogFooter>
    </form>
  )
}

