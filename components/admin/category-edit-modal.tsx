"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { createCategory, updateCategory } from "@/actions/category-actions"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Category } from "@prisma/client"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { categorySchema, type CategoryFormValues } from "@/schemas/category-schema"
import { ImageUpload } from "@/components/ui/image-upload"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Restaurant } from "@/actions/restaurant-actions"

// Extended Category type with restaurant relation
type CategoryWithRestaurant = Category & {
  restaurant: {
    id: number
    name: string
  }
}

interface CategoryEditModalProps {
  category?: CategoryWithRestaurant | null
  restaurants: Restaurant[]
  open: boolean
  onOpenChange: (refresh: boolean) => void
  mode: "create" | "edit"
}

export function CategoryEditModal({
  category,
  restaurants,
  open,
  onOpenChange,
  mode = "edit",
}: CategoryEditModalProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const isCreating = mode === "create"
  const title = isCreating ? "Add Category" : "Edit Category"
  const buttonText = isCreating ? "Create" : "Save changes"

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      description: "",
      restaurantId: 0,
      displayOrder: 0,
      imageUrl: null,
    },
  })

  // Update form data when category changes
  useEffect(() => {
    if (category && mode === "edit") {
      form.reset({
        name: category.name,
        description: category.description,
        restaurantId: category.restaurantId,
        displayOrder: category.displayOrder,
        imageUrl: category.imageUrl,
      })
    } else if (mode === "create") {
      form.reset({
        name: "",
        description: "",
        restaurantId: restaurants[0]?.id || 0,
        displayOrder: 0,
        imageUrl: null,
      })
    }
  }, [category, mode, form, restaurants])

  const onSubmit = async (data: CategoryFormValues) => {
    setIsLoading(true)
    try {
      let result

      if (isCreating) {
        result = await createCategory({
          name: data.name,
          description: data.description ?? null,
          restaurantId: data.restaurantId,
          displayOrder: data.displayOrder || 0,
          imageUrl: data.imageUrl,
        })
      } else if (category) {
        result = await updateCategory(category.id, {
          name: data.name,
          description: data.description ?? null,
          restaurantId: data.restaurantId,
          displayOrder: data.displayOrder || 0,
          imageUrl: data.imageUrl,
        })
      }

      if (result?.success) {
        toast({
          title: isCreating ? "Category created" : "Category updated",
          description: isCreating
            ? "The category has been created successfully."
            : "The category has been updated successfully.",
        })
        onOpenChange(true) // Close modal and refresh data
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result?.error || (isCreating ? "Failed to create category" : "Failed to update category"),
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
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Category name" disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          value={field.value || ""}
                          placeholder="Category description (optional)"
                          rows={3}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="restaurantId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Restaurant</FormLabel>
                      <Select
                        value={field.value?.toString() || ""}
                        onValueChange={(value) => field.onChange(Number.parseInt(value))}
                        disabled={isLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a restaurant" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {restaurants.map((restaurant) => (
                            <SelectItem key={restaurant.id} value={restaurant.id.toString()}>
                              {restaurant.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="displayOrder"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display Order</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(Number.parseInt(e.target.value) || 0)}
                          min={0}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div>
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image</FormLabel>
                      <FormControl>
                        <ImageUpload value={field.value || null} onChange={field.onChange} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : buttonText}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

