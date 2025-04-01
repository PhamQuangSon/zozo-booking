"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { createMenuItem, updateMenuItem } from "@/actions/menu-item-actions"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import type { Category, MenuItem, Restaurant } from "@prisma/client"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { menuItemSchema, type MenuItemFormValues } from "@/schemas/menu-item-schema"
import { ImageUpload } from "@/components/ui/image-upload"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

// Extended MenuItem type with category and restaurant relations
type MenuItemWithRelations = MenuItem & {
  category: Category
  restaurant: Restaurant
}

interface MenuItemEditModalProps {
  menuItem?: MenuItemWithRelations | null
  categories: Category[]
  restaurants: Restaurant[]
  open: boolean
  onOpenChange: (refresh: boolean) => void
  mode: "create" | "edit"
}

export function MenuItemEditModal({
  menuItem,
  categories,
  restaurants = [], // Add default empty array to prevent null/undefined errors
  open,
  onOpenChange,
  mode = "edit",
}: MenuItemEditModalProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [filteredCategories, setFilteredCategories] = useState<Category[]>(categories || []) // Add default empty array

  const isCreating = mode === "create"
  const title = isCreating ? "Add Menu Item" : "Edit Menu Item"
  const buttonText = isCreating ? "Create" : "Save changes"

  const defaultRestaurantId = restaurants?.[0]?.id
  const defaultCategoryId = categories?.find(c => c.restaurantId === defaultRestaurantId)?.id

  const form = useForm<MenuItemFormValues>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      name: "",
      description: null,
      price: 0,
      categoryId: defaultCategoryId || 0,
      restaurantId: defaultRestaurantId || 0,
      isAvailable: true,
      displayOrder: 0,
      imageUrl: null,
    },
  })

  // Get the current restaurant ID from the form
  const currentRestaurantId = form.watch("restaurantId")

  // Filter categories based on selected restaurant
  useEffect(() => {
    if (currentRestaurantId && categories?.length) {
      setFilteredCategories(categories.filter((category) => category.restaurantId === currentRestaurantId))
    } else {
      setFilteredCategories(categories || [])
    }
  }, [currentRestaurantId, categories])

  // Update form data when menuItem changes
  useEffect(() => {
    if (menuItem && mode === "edit") {
      form.reset({
        name: menuItem.name,
        description: menuItem.description,
        price: typeof menuItem.price === 'number' ? menuItem.price : Number(menuItem.price.toString()),
        categoryId: menuItem.categoryId,
        restaurantId: menuItem.restaurantId,
        isAvailable: menuItem.isAvailable,
        displayOrder: menuItem.displayOrder || 0,
        imageUrl: menuItem.imageUrl,
      })
    } else if (mode === "create") {
      const defaultRestaurantId = restaurants?.[0]?.id || 0
      const defaultCategoryId = categories?.find((c) => c.restaurantId === defaultRestaurantId)?.id || 0

      form.reset({
        name: "",
        description: "",
        price: 0,
        categoryId: defaultCategoryId,
        restaurantId: defaultRestaurantId,
        isAvailable: true,
        displayOrder: 0,
        imageUrl: null,
      })
    }
  }, [menuItem, mode, form, restaurants, categories])

  const onSubmit = async (data: MenuItemFormValues) => {
    setIsLoading(true)
    try {
      let result

      if (isCreating) {
        const payload = {
          name: data.name,
          description: data.description ?? null,
          price: parseFloat(data.price.toFixed(2)),
          categoryId: Number(data.categoryId),
          restaurantId: Number(data.restaurantId),
          isAvailable: Boolean(data.isAvailable),
          displayOrder: data.displayOrder ?? 0, 
          imageUrl: data.imageUrl ?? null,
        }
        result = await createMenuItem(payload)
      } else if (menuItem) {
        const payload = {
          name: data.name,
          description: data.description ?? null,
          price: parseFloat(data.price.toFixed(2)),
          categoryId: Number(data.categoryId),
          restaurantId: Number(data.restaurantId),
          isAvailable: Boolean(data.isAvailable),
          displayOrder: data.displayOrder ?? menuItem.displayOrder ?? 0,
          imageUrl: data.imageUrl ?? null,
        }
        result = await updateMenuItem(menuItem.id, payload)
      }

      if (result?.success) {
        toast({
          title: isCreating ? "Menu item created" : "Menu item updated",
          description: isCreating
            ? "The menu item has been created successfully."
            : "The menu item has been updated successfully.",
        })
        onOpenChange(true) // Close modal and refresh data
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result?.error || (isCreating ? "Failed to create menu item" : "Failed to update menu item"),
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

  // Handle restaurant change
  const handleRestaurantChange = (restaurantId: number) => {
    form.setValue("restaurantId", restaurantId)

    // Reset category if it doesn't belong to the selected restaurant
    const currentCategoryId = form.getValues("categoryId")
    const categoryBelongsToRestaurant =
      categories?.some((c) => c.id === currentCategoryId && c.restaurantId === restaurantId) || false

    if (!categoryBelongsToRestaurant) {
      const firstCategoryForRestaurant = categories?.find((c) => c.restaurantId === restaurantId)
      form.setValue("categoryId", firstCategoryForRestaurant?.id || 0)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onOpenChange(false)}>
      <DialogContent className="sm:max-w-[700px]">
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
                        <Input {...field} placeholder="Menu item name" disabled={isLoading} />
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
                          placeholder="Menu item description (optional)"
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
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          {...field}
                          onChange={(e) => {
                            const value = e.target.value;
                            field.onChange(value === '' ? 0 : Number(value));
                          }}
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
                        onValueChange={(value) => handleRestaurantChange(Number.parseInt(value))}
                        disabled={isLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a restaurant" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {restaurants?.map((restaurant) => (
                            <SelectItem key={restaurant.id} value={restaurant.id.toString()}>
                              {restaurant.name}
                            </SelectItem>
                          )) || <SelectItem value="none">No restaurants available</SelectItem>}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        value={field.value?.toString() || ""}
                        onValueChange={(value) => field.onChange(Number.parseInt(value))}
                        disabled={isLoading || filteredCategories.length === 0}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                filteredCategories.length === 0 ? "No categories available" : "Select a category"
                              }
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {filteredCategories.map((category) => (
                            <SelectItem key={category.id} value={category.id.toString()}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
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

                  <FormField
                    control={form.control}
                    name="isAvailable"
                    render={({ field }) => (
                      <FormItem className="flex flex-column items-start items-end space-x-2 space-y-0 rounded-md p-4">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} disabled={isLoading} />
                        </FormControl>
                        <FormLabel className="cursor-pointer">Available</FormLabel>
                      </FormItem>
                    )}
                  />
                </div>
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

